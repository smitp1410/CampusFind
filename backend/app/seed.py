import os
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.location import Location
from app.models.item import Item, ItemImage, ItemType, ItemStatus
from app.models.claim import Claim, Handover, ClaimStatus, HandoverStatus
from app.models.notification import Notification, NotificationType
from app.models.audit_log import AuditLog
from app.services.matching_engine import run_matching_for_item

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already contains data. Skipping full re-seed.")
            return

        print("Seeding CampusFind database with realistic campus data...")

        # 1. Categories
        categories_data = [
            {"name": "Electronics", "slug": "electronics", "icon": "laptop", "description": "Laptops, phones, tablets, chargers, and headphones"},
            {"name": "Bags & Backpacks", "slug": "bags-backpacks", "icon": "briefcase", "description": "Backpacks, tote bags, laptop sleeves, and gym sacks"},
            {"name": "Documents & Cards", "slug": "documents-cards", "icon": "file-text", "description": "Student IDs, passports, driver licenses, and notebooks"},
            {"name": "Accessories & Jewelry", "slug": "accessories", "icon": "watch", "description": "Watches, glasses, rings, scarves, and jewelry"},
            {"name": "Books & Stationery", "slug": "books-stationery", "icon": "book-open", "description": "Textbooks, binders, calculators, and pencil cases"},
            {"name": "Clothing & Outerwear", "slug": "clothing", "icon": "shirt", "description": "Jackets, hoodies, caps, and coats"},
            {"name": "Keys & Fobs", "slug": "keys-fobs", "icon": "key", "description": "Dorm keys, car keys, bike lock keys, and lanyards"},
            {"name": "Sports & Gear", "slug": "sports-gear", "icon": "dumbbell", "description": "Water bottles, sports gear, and musical instruments"}
        ]
        created_categories = {}
        for c in categories_data:
            cat = Category(**c)
            db.add(cat)
            db.flush()
            created_categories[c["slug"]] = cat

        # 2. Campus Locations
        locations_data = [
            {"campus_name": "Main Campus", "building_name": "Central Library", "zone_code": "LIB-2F", "description": "2nd floor quiet study pods, east reading wing and computer lounge"},
            {"campus_name": "Main Campus", "building_name": "Science & Tech Complex", "zone_code": "STC-1F", "description": "Ground floor robotics laboratory, lecture hall A, and atrium"},
            {"campus_name": "Main Campus", "building_name": "Student Union & Dining Hall", "zone_code": "SU-1F", "description": "Food court, student lounge, club rooms, and campus bookstore"},
            {"campus_name": "Main Campus", "building_name": "Athletic & Recreation Center", "zone_code": "ARC-GYM", "description": "Main basketball pavilion, weight room, and locker room hall"},
            {"campus_name": "Main Campus", "building_name": "Fine Arts & Architecture Pavilion", "zone_code": "FAP-3F", "description": "Design drafting studios, darkroom, and exhibition gallery"},
            {"campus_name": "North Campus", "building_name": "Engineering Research Hub", "zone_code": "ERH-4F", "description": "Advanced mechanical workshops, seminar suites, and faculty offices"}
        ]
        created_locations = []
        for loc in locations_data:
            l = Location(**loc)
            db.add(l)
            db.flush()
            created_locations.append(l)

        # 3. Users with secure hashed demo passwords
        default_pwd = get_password_hash("Password123!")
        
        users_data = [
            {
                "email": "admin@campus.edu",
                "hashed_password": default_pwd,
                "full_name": "Marcus Vance",
                "student_faculty_id": "ADM-001",
                "role": UserRole.SUPER_ADMIN.value,
                "department": "Campus Safety & Administration",
                "phone": "+1 (555) 019-2831",
                "is_verified": True,
                "is_active": True,
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
            },
            {
                "email": "officer.miller@campus.edu",
                "hashed_password": default_pwd,
                "full_name": "Sarah Miller",
                "student_faculty_id": "SEC-104",
                "role": UserRole.ADMIN.value,
                "department": "Campus Security & Lost Property Office",
                "phone": "+1 (555) 019-4820",
                "is_verified": True,
                "is_active": True,
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80"
            },
            {
                "email": "dr.chen@campus.edu",
                "hashed_password": default_pwd,
                "full_name": "Dr. Alan Chen",
                "student_faculty_id": "FAC-882",
                "role": UserRole.FACULTY.value,
                "department": "Computer Science & AI",
                "phone": "+1 (555) 019-7714",
                "is_verified": True,
                "is_active": True,
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80"
            },
            {
                "email": "elena.rostova@campus.edu",
                "hashed_password": default_pwd,
                "full_name": "Elena Rostova",
                "student_faculty_id": "STU-2024-8192",
                "role": UserRole.STUDENT.value,
                "department": "Architecture & Spatial Design",
                "phone": "+1 (555) 019-9182",
                "is_verified": True,
                "is_active": True,
                "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80"
            },
            {
                "email": "liam.hayes@campus.edu",
                "hashed_password": default_pwd,
                "full_name": "Liam Hayes",
                "student_faculty_id": "STU-2023-4501",
                "role": UserRole.STUDENT.value,
                "department": "Mechanical Engineering",
                "phone": "+1 (555) 019-3382",
                "is_verified": True,
                "is_active": True,
                "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80"
            },
            {
                "email": "priya.patel@campus.edu",
                "hashed_password": default_pwd,
                "full_name": "Priya Patel",
                "student_faculty_id": "STU-2024-1120",
                "role": UserRole.STUDENT.value,
                "department": "Biomedical Engineering",
                "phone": "+1 (555) 019-5561",
                "is_verified": True,
                "is_active": True,
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
            }
        ]
        created_users = {}
        for u in users_data:
            usr = User(**u)
            db.add(usr)
            db.flush()
            created_users[u["email"]] = usr

        now = datetime.now(timezone.utc)

        # 4. Items (Realistic Lost & Found Items with Unsplash high quality photography)
        
        # Item 1: LOST MacBook (Elena)
        lost_macbook = Item(
            type=ItemType.LOST.value,
            title="Apple MacBook Pro 14 Space Gray",
            category_id=created_categories["electronics"].id,
            description="Left on a study desk on the 2nd floor reading hall. It has an architectural firm sticker on the top shell and a tiny scratch near the MagSafe port.",
            color="Space Gray",
            brand="Apple",
            date_occurred=now - timedelta(days=2, hours=4),
            location_id=created_locations[0].id,  # Library
            specific_location="Desk #14 next to the east window",
            floor="2nd Floor",
            identifying_details="Serial ending in 8X9M. Screen lock wallpaper has a blueprint design.",
            status=ItemStatus.OPEN.value,
            reporter_id=created_users["elena.rostova@campus.edu"].id
        )
        db.add(lost_macbook)
        db.flush()
        db.add(ItemImage(item_id=lost_macbook.id, image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80", is_primary=True))

        # Item 2: FOUND MacBook (Found by Dr. Chen) -> Strong Match Candidate!
        found_macbook = Item(
            type=ItemType.FOUND.value,
            title="Space Gray Apple MacBook Pro M-series",
            category_id=created_categories["electronics"].id,
            description="Found unattended on 2nd floor desk in Central Library east wing. Handed over to security desk.",
            color="Space Gray",
            brand="Apple",
            date_occurred=now - timedelta(days=2, hours=2),
            location_id=created_locations[0].id,  # Library
            specific_location="East reading wing desk",
            floor="2nd Floor",
            identifying_details="Sticker on the shell. Currently in safe custody.",
            storage_location="Campus Safety Vault Room 102",
            status=ItemStatus.OPEN.value,
            reporter_id=created_users["dr.chen@campus.edu"].id
        )
        db.add(found_macbook)
        db.flush()
        db.add(ItemImage(item_id=found_macbook.id, image_url="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80", is_primary=True))

        # Item 3: LOST Hydro Flask (Liam)
        lost_bottle = Item(
            type=ItemType.LOST.value,
            title="Matte Black Hydro Flask 32oz Water Bottle",
            category_id=created_categories["sports-gear"].id,
            description="32oz wide mouth insulated bottle with a flex cap and silicone boot. Has an Engineering Society sticker and minor dents on bottom ring.",
            color="Matte Black",
            brand="Hydro Flask",
            date_occurred=now - timedelta(days=1, hours=6),
            location_id=created_locations[3].id,  # Athletic Center
            specific_location="Bleachers by Court 2",
            floor="Ground Floor",
            identifying_details="Bottom boot has white paint mark",
            status=ItemStatus.OPEN.value,
            reporter_id=created_users["liam.hayes@campus.edu"].id
        )
        db.add(lost_bottle)
        db.flush()
        db.add(ItemImage(item_id=lost_bottle.id, image_url="https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80", is_primary=True))

        # Item 4: FOUND Water Bottle (Sarah Miller) -> Possible Match!
        found_bottle = Item(
            type=ItemType.FOUND.value,
            title="Black Insulated Metal Water Bottle 32oz",
            category_id=created_categories["sports-gear"].id,
            description="Found near the gymnasium locker entrance. Cleaned and registered at front desk.",
            color="Black",
            brand="Hydro Flask",
            date_occurred=now - timedelta(days=1, hours=3),
            location_id=created_locations[3].id,  # Athletic Center
            specific_location="Gym Entrance Locker Bay",
            floor="Ground Floor",
            storage_location="ARC Front Reception Shelf 3",
            status=ItemStatus.OPEN.value,
            reporter_id=created_users["officer.miller@campus.edu"].id
        )
        db.add(found_bottle)
        db.flush()
        db.add(ItemImage(item_id=found_bottle.id, image_url="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", is_primary=True))

        # Item 5: LOST Blue Backpack (Priya Patel)
        lost_bag = Item(
            type=ItemType.LOST.value,
            title="Navy Blue North Face Borealis Backpack",
            category_id=created_categories["bags-backpacks"].id,
            description="Dark navy backpack containing organic chemistry textbook, laboratory goggles, and spiral notebook.",
            color="Navy Blue",
            brand="The North Face",
            date_occurred=now - timedelta(days=3),
            location_id=created_locations[1].id,  # Science & Tech Complex
            specific_location="Lecture Hall A, Row 4",
            floor="1st Floor",
            identifying_details="Lab goggles case has student name written on the inside",
            status=ItemStatus.OPEN.value,
            reporter_id=created_users["priya.patel@campus.edu"].id
        )
        db.add(lost_bag)
        db.flush()
        db.add(ItemImage(item_id=lost_bag.id, image_url="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", is_primary=True))

        # Item 6: FOUND AirPods Pro (Officer Miller)
        found_airpods = Item(
            type=ItemType.FOUND.value,
            title="Apple AirPods Pro (2nd Gen) in White Case",
            category_id=created_categories["electronics"].id,
            description="Found on a sofa bench in Student Union dining atrium. Left earbud has tiny green speck.",
            color="White",
            brand="Apple",
            date_occurred=now - timedelta(days=1, hours=8),
            location_id=created_locations[2].id,  # Student Union
            specific_location="East Dining Atrium Sofa",
            floor="1st Floor",
            storage_location="Security Lost Property Locker #4",
            status=ItemStatus.OPEN.value,
            reporter_id=created_users["officer.miller@campus.edu"].id
        )
        db.add(found_airpods)
        db.flush()
        db.add(ItemImage(item_id=found_airpods.id, image_url="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80", is_primary=True))

        # Item 7: RESOLVED / RETURNED Item (Car Key with Lanyard)
        resolved_key = Item(
            type=ItemType.FOUND.value,
            title="Toyota Smart Key with University Lanyard",
            category_id=created_categories["keys-fobs"].id,
            description="Found in Fine Arts parking lot pathway. Returned to verified owner through security handover.",
            color="Black & Silver",
            brand="Toyota",
            date_occurred=now - timedelta(days=5),
            location_id=created_locations[4].id,
            specific_location="Exterior Courtyard Steps",
            floor="Ground Level",
            storage_location="Campus Safety Office",
            status=ItemStatus.RESOLVED.value,
            reporter_id=created_users["officer.miller@campus.edu"].id
        )
        db.add(resolved_key)
        db.flush()
        db.add(ItemImage(item_id=resolved_key.id, image_url="https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?auto=format&fit=crop&w=800&q=80", is_primary=True))

        # Completed Claim and Handover for resolved item
        claim_key = Claim(
            item_id=resolved_key.id,
            claimant_id=created_users["liam.hayes@campus.edu"].id,
            ownership_proof="Toyota RAV4 2021 key fob. Red silicone protector ring around the emergency physical key release button.",
            status=ClaimStatus.RETURNED.value,
            admin_notes="Student presented matching car registration and vehicle unlocked upon test outside station.",
            reviewed_by_id=created_users["officer.miller@campus.edu"].id,
            reviewed_at=now - timedelta(days=4)
        )
        db.add(claim_key)
        db.flush()

        handover_key = Handover(
            claim_id=claim_key.id,
            handover_code="CF-TY9821",
            handover_location="Main Campus Security Post Window 1",
            status=HandoverStatus.COMPLETED.value,
            completed_at=now - timedelta(days=4),
            confirmed_by_id=created_users["officer.miller@campus.edu"].id,
            notes="Student ID verified. Physical handover completed successfully."
        )
        db.add(handover_key)

        # 5. Run Smart Matching Engine on the seeded items!
        db.commit()
        print("Running smart matching algorithm on seeded records...")
        run_matching_for_item(db, lost_macbook)
        run_matching_for_item(db, lost_bottle)
        run_matching_for_item(db, lost_bag)

        # 6. Audit Logs
        db.add(AuditLog(
            user_id=created_users["admin@campus.edu"].id,
            action="SYSTEM_INITIALIZATION",
            target_type="system",
            target_id=1,
            details="CampusFind system seeded with authentic university categories, locations, and demo data."
        ))
        db.commit()

        print("Seeding completed successfully!")
        print("\n=== DEMO CREDENTIALS ===")
        print("Super Admin: admin@campus.edu / Password123!")
        print("Staff Admin: officer.miller@campus.edu / Password123!")
        print("Faculty:     dr.chen@campus.edu / Password123!")
        print("Student 1:   elena.rostova@campus.edu / Password123!")
        print("Student 2:   liam.hayes@campus.edu / Password123!")
        print("Student 3:   priya.patel@campus.edu / Password123!")
        print("========================\n")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
