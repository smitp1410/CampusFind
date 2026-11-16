from datetime import datetime, timezone, timedelta
from app.services.matching_engine import (
    calculate_name_similarity,
    calculate_category_match,
    calculate_location_match,
    calculate_date_proximity,
    calculate_description_similarity,
    calculate_color_match,
    evaluate_match_score
)
from app.models.item import Item
from app.models.location import Location

def test_name_similarity_weights():
    # Identical or near identical titles
    score = calculate_name_similarity("MacBook Pro 14 Space Gray", "Apple MacBook Pro 14 Space Gray")
    assert score >= 20.0  # Out of 25

    # Completely different titles
    diff_score = calculate_name_similarity("MacBook Pro 14", "Silver Keychain")
    assert diff_score <= 5.0

def test_category_match_weights():
    assert calculate_category_match(1, 1) == 20.0
    assert calculate_category_match(1, 2) == 0.0

def test_location_match_weights():
    loc1 = Location(id=1, building_name="Central Library", campus_name="Main Campus")
    loc2 = Location(id=1, building_name="Central Library", campus_name="Main Campus")
    loc3 = Location(id=2, building_name="Science Hall", campus_name="Main Campus")

    # Same building, same floor
    assert calculate_location_match(loc1, loc2, "2nd Floor", "2nd Floor") == 20.0
    # Same building, different floor
    assert calculate_location_match(loc1, loc2, "2nd Floor", "3rd Floor") >= 16.0
    # Different building, same campus
    assert calculate_location_match(loc1, loc3) == 8.0

def test_date_proximity_weights():
    base_date = datetime.now(timezone.utc)
    # Found within 2 hours after lost
    assert calculate_date_proximity(base_date, base_date + timedelta(hours=2)) == 15.0
    # Found 2 days after lost
    assert calculate_date_proximity(base_date, base_date + timedelta(days=2)) == 13.0
    # Found 6 days after lost
    assert calculate_date_proximity(base_date, base_date + timedelta(days=6)) == 10.0
    # Found way before lost
    assert calculate_date_proximity(base_date, base_date - timedelta(days=10)) == 0.0

def test_color_match_weights():
    assert calculate_color_match("Space Gray", "Space Gray") == 10.0
    assert calculate_color_match("Space Gray", "Gray") == 8.0
    assert calculate_color_match("Red", "Blue") == 0.0

def test_full_evaluation_strong_match():
    now = datetime.now(timezone.utc)
    loc = Location(id=1, building_name="Central Library", campus_name="Main Campus")
    
    lost = Item(
        id=1,
        title="Apple MacBook Pro 14",
        category_id=1,
        description="Space gray laptop with developer stickers left on reading desk",
        color="Space Gray",
        date_occurred=now - timedelta(hours=5),
        location=loc,
        floor="2nd Floor"
    )
    
    found = Item(
        id=2,
        title="Apple MacBook Pro 14 M-series",
        category_id=1,
        description="Space gray laptop found unattended on 2nd floor library reading desk",
        color="Space Gray",
        date_occurred=now - timedelta(hours=3),
        location=loc,
        floor="2nd Floor"
    )

    total_score, classification, breakdown = evaluate_match_score(lost, found)
    assert total_score >= 80.0
    assert classification == "STRONG"
    assert "factors" in breakdown
    assert breakdown["factors"]["category_match"]["matched"] is True
