import re
import math
from datetime import datetime, timezone
from difflib import SequenceMatcher
from typing import Dict, Any, Tuple, List, Optional
from sqlalchemy.orm import Session
from app.models.item import Item, ItemType, ItemStatus
from app.models.match import Match, MatchClassification, MatchStatus
from app.models.notification import Notification, NotificationType

STOP_WORDS = {
    "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with",
    "by", "from", "up", "about", "into", "over", "after", "my", "lost", "found",
    "left", "item", "belonging", "please", "help"
}

def clean_text(text: Optional[str]) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    tokens = [w for w in text.split() if w and w not in STOP_WORDS]
    return " ".join(tokens)

def text_similarity(text1: str, text2: str) -> float:
    c1 = clean_text(text1)
    c2 = clean_text(text2)
    if not c1 or not c2:
        return 0.0
    
    # Direct match or substring
    if c1 == c2:
        return 1.0
    if c1 in c2 or c2 in c1:
        return 0.85

    # Sequence matcher
    seq_ratio = SequenceMatcher(None, c1, c2).ratio()
    
    # Token Jaccard similarity
    tokens1 = set(c1.split())
    tokens2 = set(c2.split())
    jaccard = len(tokens1 & tokens2) / max(len(tokens1 | tokens2), 1)
    
    # Blended similarity
    return round(max(seq_ratio, jaccard * 0.9 + seq_ratio * 0.1), 3)

def calculate_name_similarity(name1: str, name2: str) -> float:
    """Weight: 25 points"""
    ratio = text_similarity(name1, name2)
    return round(ratio * 25.0, 2)

def calculate_category_match(cat1_id: int, cat2_id: int) -> float:
    """Weight: 20 points"""
    return 20.0 if cat1_id == cat2_id else 0.0

def calculate_location_match(loc1, loc2, floor1: Optional[str] = None, floor2: Optional[str] = None) -> float:
    """Weight: 20 points"""
    if not loc1 or not loc2:
        return 0.0
    
    # Same building
    if loc1.id == loc2.id or (loc1.building_name.lower().strip() == loc2.building_name.lower().strip()):
        base_score = 16.0
        # Floor bonus
        if floor1 and floor2 and clean_text(floor1) and clean_text(floor1) == clean_text(floor2):
            base_score += 4.0
        else:
            base_score += 2.0
        return min(base_score, 20.0)
    
    # Same campus
    if loc1.campus_name and loc2.campus_name and loc1.campus_name.lower().strip() == loc2.campus_name.lower().strip():
        return 8.0
        
    return 0.0

def calculate_date_proximity(lost_date: datetime, found_date: datetime) -> float:
    """Weight: 15 points"""
    # Normalize dates
    if lost_date.tzinfo is None:
        lost_date = lost_date.replace(tzinfo=timezone.utc)
    if found_date.tzinfo is None:
        found_date = found_date.replace(tzinfo=timezone.utc)
        
    diff_seconds = (found_date - lost_date).total_seconds()
    diff_days = diff_seconds / 86400.0

    # Found date before lost date (small grace period for estimated dates)
    if diff_days < -2.0:
        return 0.0
    elif -2.0 <= diff_days < 0:
        return 7.5  # Estimated error allowance

    # Found on or after lost date
    if diff_days <= 1.0:
        return 15.0
    elif diff_days <= 3.0:
        return 13.0
    elif diff_days <= 7.0:
        return 10.0
    elif diff_days <= 14.0:
        return 6.0
    elif diff_days <= 30.0:
        return 3.0
    else:
        return 1.0

def calculate_description_similarity(desc1: str, desc2: str) -> float:
    """Weight: 10 points"""
    ratio = text_similarity(desc1, desc2)
    return round(ratio * 10.0, 2)

def calculate_color_match(color1: str, color2: str) -> float:
    """Weight: 10 points"""
    c1 = clean_text(color1)
    c2 = clean_text(color2)
    if not c1 or not c2:
        return 0.0
    if c1 == c2:
        return 10.0
    if c1 in c2 or c2 in c1:
        return 8.0
    
    # Check individual color token intersection
    t1 = set(c1.split())
    t2 = set(c2.split())
    if t1 & t2:
        return 7.0
        
    return 0.0

def evaluate_match_score(lost_item: Item, found_item: Item) -> Tuple[float, str, Dict[str, Any]]:
    """
    Calculates total normalized match score (0-100) and provides
    comprehensive breakdown for transparent explainability.
    """
    name_pts = calculate_name_similarity(lost_item.title, found_item.title)
    cat_pts = calculate_category_match(lost_item.category_id, found_item.category_id)
    loc_pts = calculate_location_match(lost_item.location, found_item.location, lost_item.floor, found_item.floor)
    date_pts = calculate_date_proximity(lost_item.date_occurred, found_item.date_occurred)
    desc_pts = calculate_description_similarity(lost_item.description, found_item.description)
    color_pts = calculate_color_match(lost_item.color, found_item.color)

    total_score = round(name_pts + cat_pts + loc_pts + date_pts + desc_pts + color_pts, 1)
    total_score = min(max(total_score, 0.0), 100.0)

    if total_score >= 80.0:
        classification = MatchClassification.STRONG.value
    elif total_score >= 50.0:
        classification = MatchClassification.POSSIBLE.value
    else:
        classification = MatchClassification.LOW.value

    breakdown = {
        "factors": {
            "name_similarity": {"score": name_pts, "max": 25.0, "percentage": round((name_pts / 25.0) * 100, 1)},
            "category_match": {"score": cat_pts, "max": 20.0, "matched": cat_pts == 20.0},
            "location_proximity": {"score": loc_pts, "max": 20.0, "percentage": round((loc_pts / 20.0) * 100, 1)},
            "date_proximity": {"score": date_pts, "max": 15.0, "percentage": round((date_pts / 15.0) * 100, 1)},
            "description_similarity": {"score": desc_pts, "max": 10.0, "percentage": round((desc_pts / 10.0) * 100, 1)},
            "color_match": {"score": color_pts, "max": 10.0, "percentage": round((color_pts / 10.0) * 100, 1)}
        },
        "summary": f"{classification.capitalize()} match ({total_score}%). " + (
            "High confidence on category, name, and campus location." if total_score >= 80
            else "Potential overlap in item characteristics and reported location." if total_score >= 50
            else "Low overall correlation."
        )
    }

    return total_score, classification, breakdown

def run_matching_for_item(db: Session, target_item: Item) -> List[Match]:
    """
    Runs matching against counterpart pool:
    - If target is LOST: compare against all active/open FOUND items.
    - If target is FOUND: compare against all active/open LOST items.
    Creates or updates Match records and triggers notifications for score >= 50.
    """
    matches_created_or_updated = []

    if target_item.type == ItemType.LOST.value:
        counterparts = db.query(Item).filter(
            Item.type == ItemType.FOUND.value,
            Item.status.in_([ItemStatus.OPEN.value, ItemStatus.MATCHED.value]),
            Item.id != target_item.id,
            Item.reporter_id != target_item.reporter_id
        ).all()
        lost_items = [target_item]
    else:
        counterparts = db.query(Item).filter(
            Item.type == ItemType.LOST.value,
            Item.status.in_([ItemStatus.OPEN.value, ItemStatus.MATCHED.value]),
            Item.id != target_item.id,
            Item.reporter_id != target_item.reporter_id
        ).all()
        lost_items = counterparts

    for counterpart in counterparts:
        lost_obj = target_item if target_item.type == ItemType.LOST.value else counterpart
        found_obj = counterpart if target_item.type == ItemType.LOST.value else target_item

        score, classification, breakdown = evaluate_match_score(lost_obj, found_obj)

        # We record matches that have at least some relevance (e.g., score >= 35)
        if score >= 35.0:
            existing_match = db.query(Match).filter(
                Match.lost_item_id == lost_obj.id,
                Match.found_item_id == found_obj.id
            ).first()

            if existing_match:
                existing_match.score = score
                existing_match.classification = classification
                existing_match.breakdown = breakdown
                matches_created_or_updated.append(existing_match)
            else:
                new_match = Match(
                    lost_item_id=lost_obj.id,
                    found_item_id=found_obj.id,
                    score=score,
                    classification=classification,
                    breakdown=breakdown,
                    status=MatchStatus.PENDING.value
                )
                db.add(new_match)
                matches_created_or_updated.append(new_match)

                # Send notifications if Strong or Possible match
                if score >= 50.0:
                    # Notify lost item reporter
                    notif_lost = Notification(
                        user_id=lost_obj.reporter_id,
                        title=f"Potential Match Found ({score}%)",
                        message=f"A found item '{found_obj.title}' closely matches your lost report '{lost_obj.title}'.",
                        type=NotificationType.MATCH_FOUND.value,
                        link=f"/matches"
                    )
                    db.add(notif_lost)

                    # Update item status to MATCHED if still OPEN
                    if lost_obj.status == ItemStatus.OPEN.value:
                        lost_obj.status = ItemStatus.MATCHED.value
                    if found_obj.status == ItemStatus.OPEN.value:
                        found_obj.status = ItemStatus.MATCHED.value

    db.commit()
    return matches_created_or_updated
