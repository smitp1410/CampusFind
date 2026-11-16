from datetime import datetime, timezone
from app.models.category import Category
from app.models.location import Location
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def test_items_and_claims_flow(client, db):
    # Create test category and location
    cat = Category(name="Electronics", slug="electronics", icon="laptop")
    loc = Location(campus_name="Main Campus", building_name="Library", zone_code="LIB-1")
    db.add(cat)
    db.add(loc)
    
    # Create test users
    student = User(
        email="stu1@campus.edu",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Student One",
        role=UserRole.STUDENT.value,
        is_verified=True,
        is_active=True
    )
    admin = User(
        email="admin1@campus.edu",
        hashed_password=get_password_hash("Pass123!"),
        full_name="Staff Admin",
        role=UserRole.ADMIN.value,
        is_verified=True,
        is_active=True
    )
    db.add(student)
    db.add(admin)
    db.commit()

    # Get student token
    login_res = client.post("/api/v1/auth/login", json={"email": "stu1@campus.edu", "password": "Pass123!"})
    stu_token = login_res.json()["access_token"]
    stu_headers = {"Authorization": f"Bearer {stu_token}"}

    # Get admin token
    admin_login = client.post("/api/v1/auth/login", json={"email": "admin1@campus.edu", "password": "Pass123!"})
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Report a FOUND item
    found_payload = {
        "type": "FOUND",
        "title": "Sony WH-1000XM5 Headphones",
        "category_id": cat.id,
        "description": "Silver wireless over-ear noise cancelling headphones found on bench",
        "color": "Silver",
        "brand": "Sony",
        "date_occurred": datetime.now(timezone.utc).isoformat(),
        "location_id": loc.id,
        "floor": "1st Floor",
        "storage_location": "Security Desk Locker 2",
        "identifying_details": "Right earcup has small blue sticker",
        "image_urls": ["https://images.unsplash.com/photo-1546435770-a3e426bf472b"]
    }
    create_res = client.post("/api/v1/items/", json=found_payload, headers=stu_headers)
    assert create_res.status_code == 201
    item_data = create_res.json()
    item_id = item_data["id"]
    assert item_data["title"] == "Sony WH-1000XM5 Headphones"

    # Search items
    search_res = client.get("/api/v1/items/?search=Sony&type=FOUND")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["total"] >= 1

    # Submit ownership claim
    claim_payload = {
        "item_id": item_id,
        "ownership_proof": "The headphones have a tiny blue star sticker on the inside of the right headband adjustment rail."
    }
    claim_res = client.post("/api/v1/claims/", json=claim_payload, headers=stu_headers)
    assert claim_res.status_code == 201
    claim_data = claim_res.json()
    claim_id = claim_data["id"]
    assert claim_data["status"] == "PENDING"

    # Admin reviews and approves claim
    approve_payload = {
        "status": "APPROVED",
        "admin_notes": "Sticker location verified exactly against item.",
        "handover_location": "Main Campus Security Post Window 1"
    }
    approve_res = client.put(f"/api/v1/claims/{claim_id}/status", json=approve_payload, headers=admin_headers)
    assert approve_res.status_code == 200
    approved_data = approve_res.json()
    assert approved_data["status"] == "APPROVED"
    assert approved_data["handover"] is not None
    handover_code = approved_data["handover"]["handover_code"]

    # Verify handover code and complete return
    verify_res = client.post(
        f"/api/v1/claims/{claim_id}/verify-handover?handover_code={handover_code}",
        headers=admin_headers
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "RETURNED"
