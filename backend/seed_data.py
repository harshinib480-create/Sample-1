import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_database():
    print("🌱 Starting database seeding...")
    
    # Clear existing data
    await db.users.delete_many({})
    await db.vendors.delete_many({})
    await db.categories.delete_many({})
    await db.products.delete_many({})
    await db.orders.delete_many({})
    await db.cart_items.delete_many({})
    print("✅ Cleared existing data")
    
    # Create admin user
    admin_user = {
        "id": "admin-001",
        "username": "admin",
        "email": "admin@marketplace.com",
        "password_hash": hash_password("admin123"),
        "role": "admin",
        "created_at": "2025-01-01T00:00:00Z"
    }
    await db.users.insert_one(admin_user)
    print("✅ Created admin user (username: admin, password: admin123)")
    
    # Create test buyer
    buyer_user = {
        "id": "buyer-001",
        "username": "testbuyer",
        "email": "buyer@test.com",
        "password_hash": hash_password("buyer123"),
        "role": "buyer",
        "created_at": "2025-01-01T00:00:00Z"
    }
    await db.users.insert_one(buyer_user)
    print("✅ Created test buyer (username: testbuyer, password: buyer123)")
    
    # Create categories
    categories = [
        {
            "id": "cat-001",
            "name": "Paint & Coatings",
            "description": "Interior and exterior paints, primers, and coatings",
            "icon": "Paintbrush"
        },
        {
            "id": "cat-002",
            "name": "Cement & Bricks",
            "description": "Cement, bricks, blocks, and masonry materials",
            "icon": "Blocks"
        },
        {
            "id": "cat-003",
            "name": "Decor & Lighting",
            "description": "Home decor items, lighting fixtures, and accessories",
            "icon": "Lamp"
        }
    ]
    await db.categories.insert_many(categories)
    print(f"✅ Created {len(categories)} categories")
    
    # Create vendor users and profiles
    vendors_data = [
        {
            "user": {
                "id": "vendor-user-001",
                "username": "vendor1",
                "email": "vendor1@test.com",
                "password_hash": hash_password("vendor123"),
                "role": "vendor",
                "created_at": "2025-01-01T00:00:00Z"
            },
            "vendor": {
                "id": "vendor-001",
                "user_id": "vendor-user-001",
                "business_name": "Green Paints India",
                "business_type": "supplier",
                "location": "Mumbai, Maharashtra",
                "gst_number": "27AABCU9603R1ZM",
                "phone": "+91-9876543210",
                "status": "verified",
                "rating": 4.5,
                "total_orders": 156,
                "created_at": "2025-01-01T00:00:00Z"
            }
        },
        {
            "user": {
                "id": "vendor-user-002",
                "username": "vendor2",
                "email": "vendor2@test.com",
                "password_hash": hash_password("vendor123"),
                "role": "vendor",
                "created_at": "2025-01-01T00:00:00Z"
            },
            "vendor": {
                "id": "vendor-002",
                "user_id": "vendor-user-002",
                "business_name": "Eco Bricks Manufacturing",
                "business_type": "manufacturer",
                "location": "Bangalore, Karnataka",
                "gst_number": "29AABCU9603R1ZN",
                "phone": "+91-9876543211",
                "status": "verified",
                "rating": 4.8,
                "total_orders": 243,
                "created_at": "2025-01-01T00:00:00Z"
            }
        },
        {
            "user": {
                "id": "vendor-user-003",
                "username": "vendor3",
                "email": "vendor3@test.com",
                "password_hash": hash_password("vendor123"),
                "role": "vendor",
                "created_at": "2025-01-01T00:00:00Z"
            },
            "vendor": {
                "id": "vendor-003",
                "user_id": "vendor-user-003",
                "business_name": "Lumina Lighting Solutions",
                "business_type": "supplier",
                "location": "Delhi NCR",
                "gst_number": "07AABCU9603R1ZO",
                "phone": "+91-9876543212",
                "status": "verified",
                "rating": 4.3,
                "total_orders": 89,
                "created_at": "2025-01-01T00:00:00Z"
            }
        },
        {
            "user": {
                "id": "vendor-user-004",
                "username": "vendor4",
                "email": "vendor4@test.com",
                "password_hash": hash_password("vendor123"),
                "role": "vendor",
                "created_at": "2025-01-01T00:00:00Z"
            },
            "vendor": {
                "id": "vendor-004",
                "user_id": "vendor-user-004",
                "business_name": "Sustainable Materials Co.",
                "business_type": "supplier",
                "location": "Pune, Maharashtra",
                "gst_number": "27AABCU9603R1ZP",
                "phone": "+91-9876543213",
                "status": "pending",
                "rating": 0.0,
                "total_orders": 0,
                "created_at": "2025-01-01T00:00:00Z"
            }
        }
    ]
    
    for vendor_data in vendors_data:
        await db.users.insert_one(vendor_data["user"])
        await db.vendors.insert_one(vendor_data["vendor"])
    
    print(f"✅ Created {len(vendors_data)} vendors (3 verified, 1 pending)")
    print("   Login: vendor1/vendor123, vendor2/vendor123, vendor3/vendor123, vendor4/vendor123")
    
    # Create products
    products = [
        # Paint & Coatings
        {
            "id": "prod-001",
            "vendor_id": "vendor-001",
            "category_id": "cat-001",
            "name": "Eco-Friendly Interior Paint - White",
            "description": "Low VOC, water-based interior paint. Perfect for bedrooms and living rooms. Covers 120 sq ft per litre.",
            "price": 450.0,
            "unit": "litre",
            "images": ["https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400"],
            "sustainability": {
                "is_recycled": False,
                "is_low_carbon": True,
                "is_energy_efficient": False,
                "co2_savings_kg": 2.5,
                "certifications": ["Green Seal Certified"]
            },
            "stock_quantity": 500,
            "delivery_days": 3,
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "prod-002",
            "vendor_id": "vendor-001",
            "category_id": "cat-001",
            "name": "Weather Shield Exterior Paint",
            "description": "Durable exterior paint with UV protection. Ideal for Indian weather conditions. 10-year warranty.",
            "price": 650.0,
            "unit": "litre",
            "images": ["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400"],
            "sustainability": {
                "is_recycled": False,
                "is_low_carbon": False,
                "is_energy_efficient": False,
                "co2_savings_kg": None,
                "certifications": []
            },
            "stock_quantity": 300,
            "delivery_days": 3,
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "prod-003",
            "vendor_id": "vendor-001",
            "category_id": "cat-001",
            "name": "Wooden Finish Primer",
            "description": "High-quality primer for wooden surfaces. Prevents termites and moisture damage.",
            "price": 380.0,
            "unit": "litre",
            "images": ["https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=400"],
            "sustainability": {
                "is_recycled": False,
                "is_low_carbon": True,
                "is_energy_efficient": False,
                "co2_savings_kg": 1.8,
                "certifications": []
            },
            "stock_quantity": 200,
            "delivery_days": 5,
            "created_at": "2025-01-01T00:00:00Z"
        },
        
        # Cement & Bricks
        {
            "id": "prod-004",
            "vendor_id": "vendor-002",
            "category_id": "cat-002",
            "name": "Recycled Fly Ash Bricks",
            "description": "Made from 60% recycled industrial waste. Stronger than red clay bricks. Size: 9x4x3 inches.",
            "price": 8.5,
            "unit": "piece",
            "images": ["https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400"],
            "sustainability": {
                "is_recycled": True,
                "is_low_carbon": True,
                "is_energy_efficient": False,
                "co2_savings_kg": 5.2,
                "certifications": ["BIS Certified"]
            },
            "stock_quantity": 50000,
            "delivery_days": 7,
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "prod-005",
            "vendor_id": "vendor-002",
            "category_id": "cat-002",
            "name": "Premium Portland Cement",
            "description": "Grade 53 OPC cement. High strength, quick setting. Perfect for structural work.",
            "price": 420.0,
            "unit": "50kg bag",
            "images": ["https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400"],
            "sustainability": {
                "is_recycled": False,
                "is_low_carbon": False,
                "is_energy_efficient": False,
                "co2_savings_kg": None,
                "certifications": ["BIS IS 12269"]
            },
            "stock_quantity": 2000,
            "delivery_days": 5,
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "prod-006",
            "vendor_id": "vendor-002",
            "category_id": "cat-002",
            "name": "Eco Concrete Blocks",
            "description": "Lightweight concrete blocks made with recycled aggregates. Excellent thermal insulation.",
            "price": 45.0,
            "unit": "piece",
            "images": ["https://images.unsplash.com/photo-1521133573892-e44906baee46?w=400"],
            "sustainability": {
                "is_recycled": True,
                "is_low_carbon": True,
                "is_energy_efficient": True,
                "co2_savings_kg": 8.5,
                "certifications": ["LEED Approved"]
            },
            "stock_quantity": 10000,
            "delivery_days": 7,
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "prod-007",
            "vendor_id": "vendor-002",
            "category_id": "cat-002",
            "name": "Red Clay Bricks (Traditional)",
            "description": "Traditional kiln-fired red clay bricks. Time-tested durability. Size: 9x4x3 inches.",
            "price": 7.0,
            "unit": "piece",
            "images": ["https://images.unsplash.com/photo-1585128903994-54f8e9eb5e90?w=400"],
            "sustainability": {
                "is_recycled": False,
                "is_low_carbon": False,
                "is_energy_efficient": False,
                "co2_savings_kg": None,
                "certifications": []
            },
            "stock_quantity": 80000,
            "delivery_days": 7,
            "created_at": "2025-01-01T00:00:00Z"
        },
        
        # Decor & Lighting
        {
            "id": "prod-008",
            "vendor_id": "vendor-003",
            "category_id": "cat-003",
            "name": "LED Ceiling Panel - 18W",
            "description": "Energy-efficient LED panel light. 85% energy savings vs traditional lights. 50,000 hour lifespan.",
            "price": 850.0,
            "unit": "piece",
            "images": ["https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400"],
            "sustainability": {
                "is_recycled": False,
                "is_low_carbon": False,
                "is_energy_efficient": True,
                "co2_savings_kg": 12.0,
                "certifications": ["BEE 5 Star Rated"]
            },
            "stock_quantity": 500,
            "delivery_days": 4,
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "prod-009",
            "vendor_id": "vendor-003",
            "category_id": "cat-003",
            "name": "Bamboo Pendant Lamp",
            "description": "Handcrafted bamboo pendant light. Sustainable material. Creates warm ambient lighting.",
            "price": 1200.0,
            "unit": "piece",
            "images": ["https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400"],
            "sustainability": {
                "is_recycled": True,
                "is_low_carbon": True,
                "is_energy_efficient": False,
                "co2_savings_kg": 3.5,
                "certifications": ["FSC Certified Bamboo"]
            },
            "stock_quantity": 150,
            "delivery_days": 5,
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "prod-010",
            "vendor_id": "vendor-003",
            "category_id": "cat-003",
            "name": "Solar Garden Light Set (4pcs)",
            "description": "Solar-powered garden lights. Auto on/off sensor. No electricity cost. Weather-resistant.",
            "price": 2400.0,
            "unit": "set",
            "images": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
            "sustainability": {
                "is_recycled": False,
                "is_low_carbon": True,
                "is_energy_efficient": True,
                "co2_savings_kg": 25.0,
                "certifications": []
            },
            "stock_quantity": 200,
            "delivery_days": 4,
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "prod-011",
            "vendor_id": "vendor-003",
            "category_id": "cat-003",
            "name": "Recycled Glass Wall Art",
            "description": "Decorative wall art made from 100% recycled glass. Handcrafted by local artisans. Unique patterns.",
            "price": 3500.0,
            "unit": "piece",
            "images": ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400"],
            "sustainability": {
                "is_recycled": True,
                "is_low_carbon": True,
                "is_energy_efficient": False,
                "co2_savings_kg": 6.8,
                "certifications": ["Fair Trade Certified"]
            },
            "stock_quantity": 50,
            "delivery_days": 6,
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "prod-012",
            "vendor_id": "vendor-003",
            "category_id": "cat-003",
            "name": "Smart LED Bulb - 9W (Color Changing)",
            "description": "WiFi-enabled smart bulb. Control via app. 16 million colors. Voice control compatible.",
            "price": 650.0,
            "unit": "piece",
            "images": ["https://images.unsplash.com/photo-1550985543-49bee3167284?w=400"],
            "sustainability": {
                "is_recycled": False,
                "is_low_carbon": False,
                "is_energy_efficient": True,
                "co2_savings_kg": 8.5,
                "certifications": ["BEE 4 Star Rated"]
            },
            "stock_quantity": 400,
            "delivery_days": 3,
            "created_at": "2025-01-01T00:00:00Z"
        }
    ]
    
    await db.products.insert_many(products)
    print(f"✅ Created {len(products)} products across 3 categories")
    
    # Create text index for product search
    await db.products.create_index([("name", "text"), ("description", "text")])
    print("✅ Created text search index on products")
    
    print("\n" + "="*60)
    print("🎉 DATABASE SEEDING COMPLETE!")
    print("="*60)
    print("\n📝 Test Credentials:")
    print("   Admin: username=admin, password=admin123")
    print("   Buyer: username=testbuyer, password=buyer123")
    print("   Vendors: username=vendor1/2/3/4, password=vendor123")
    print("\n📊 Data Summary:")
    print(f"   - {len(categories)} categories")
    print(f"   - {len(vendors_data)} vendors (3 verified, 1 pending)")
    print(f"   - {len(products)} products")
    print("\n🌱 Sustainability Features:")
    print("   - 6 products with eco-friendly features")
    print("   - CO₂ savings tracking on multiple items")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(seed_database())
    client.close()