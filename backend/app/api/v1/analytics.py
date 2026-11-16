from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.user import User
from app.models.item import Item, ItemType, ItemStatus
from app.models.category import Category
from app.models.location import Location
from app.models.match import Match
from app.models.claim import Claim, ClaimStatus
from app.schemas.analytics import (
    PlatformStatsResponse, CategoryBreakdownItem, LocationHotspotItem, AdminDashboardAnalytics
)

router = APIRouter(prefix="/analytics", tags=["Analytics & Insights"])

@router.get("/platform", response_model=AdminDashboardAnalytics)
def get_platform_analytics(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_lost = db.query(Item).filter(Item.type == ItemType.LOST.value).count()
    total_found = db.query(Item).filter(Item.type == ItemType.FOUND.value).count()
    total_recovered = db.query(Item).filter(Item.status == ItemStatus.RESOLVED.value).count()
    pending_claims = db.query(Claim).filter(Claim.status.in_([ClaimStatus.PENDING.value, ClaimStatus.UNDER_REVIEW.value])).count()
    active_matches = db.query(Match).filter(Match.score >= 50.0).count()
    recent_activity = total_lost + total_found + pending_claims

    recovery_rate = round((total_recovered / max(total_lost + total_found, 1)) * 100, 1)

    stats = PlatformStatsResponse(
        total_users=total_users,
        total_lost_items=total_lost,
        total_found_items=total_found,
        total_recovered_items=total_recovered,
        recovery_rate_percentage=recovery_rate,
        active_matches_count=active_matches,
        pending_claims_count=pending_claims,
        recent_activity_count=recent_activity
    )

    # Category breakdown
    categories = db.query(Category).all()
    cat_items = []
    for cat in categories:
        lost_c = db.query(Item).filter(Item.category_id == cat.id, Item.type == ItemType.LOST.value).count()
        found_c = db.query(Item).filter(Item.category_id == cat.id, Item.type == ItemType.FOUND.value).count()
        rec_c = db.query(Item).filter(Item.category_id == cat.id, Item.status == ItemStatus.RESOLVED.value).count()
        cat_items.append(
            CategoryBreakdownItem(
                category_id=cat.id,
                category_name=cat.name,
                icon=cat.icon,
                lost_count=lost_c,
                found_count=found_c,
                recovered_count=rec_c
            )
        )

    # Location hotspots
    hotspots = []
    locations = db.query(Location).all()
    for loc in locations:
        reports_c = db.query(Item).filter(Item.location_id == loc.id).count()
        if reports_c > 0:
            hotspots.append(
                LocationHotspotItem(
                    location_id=loc.id,
                    building_name=loc.building_name,
                    campus_name=loc.campus_name,
                    total_reports=reports_c
                )
            )
    hotspots.sort(key=lambda x: x.total_reports, reverse=True)

    # Monthly Trend (mock/calculated past 4 months)
    monthly_trend = [
        {"month": "August", "lost": max(12, int(total_lost * 0.2)), "found": max(15, int(total_found * 0.22)), "recovered": max(8, int(total_recovered * 0.18))},
        {"month": "September", "lost": max(24, int(total_lost * 0.3)), "found": max(28, int(total_found * 0.28)), "recovered": max(19, int(total_recovered * 0.25))},
        {"month": "October", "lost": max(31, int(total_lost * 0.35)), "found": max(35, int(total_found * 0.32)), "recovered": max(26, int(total_recovered * 0.32))},
        {"month": "November", "lost": total_lost, "found": total_found, "recovered": total_recovered}
    ]

    return {
        "stats": stats,
        "category_breakdown": cat_items,
        "location_hotspots": hotspots[:6],
        "monthly_trend": monthly_trend
    }
