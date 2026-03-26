from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Enums
class VendorStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PACKED = "packed"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class UserRole(str, Enum):
    BUYER = "buyer"
    VENDOR = "vendor"
    ADMIN = "admin"

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: Optional[EmailStr] = None
    password_hash: str
    role: UserRole = UserRole.BUYER
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    password: str
    role: UserRole = UserRole.BUYER

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    role: UserRole
    token: Optional[str] = None

class Vendor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    business_name: str
    business_type: str  # supplier, manufacturer
    location: str
    gst_number: Optional[str] = None
    phone: str
    status: VendorStatus = VendorStatus.PENDING
    rating: float = 0.0
    total_orders: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VendorCreate(BaseModel):
    business_name: str
    business_type: str
    location: str
    gst_number: Optional[str] = None
    phone: str

class VendorResponse(BaseModel):
    id: str
    business_name: str
    business_type: str
    location: str
    status: VendorStatus
    rating: float
    total_orders: int

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str  # icon name from lucide-react
    image_url: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    image_url: Optional[str] = None

class SustainabilityMetrics(BaseModel):
    is_recycled: bool = False
    is_low_carbon: bool = False
    is_energy_efficient: bool = False
    co2_savings_kg: Optional[float] = None
    certifications: List[str] = []

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_id: str
    category_id: str
    name: str
    description: str
    price: float
    unit: str  # kg, piece, sq ft, litre, etc
    images: List[str] = []  # URLs or paths
    sustainability: SustainabilityMetrics = Field(default_factory=SustainabilityMetrics)
    stock_quantity: int = 0
    delivery_days: int = 7
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    category_id: str
    name: str
    description: str
    price: float
    unit: str
    images: List[str] = []
    sustainability: SustainabilityMetrics = Field(default_factory=SustainabilityMetrics)
    stock_quantity: int = 0
    delivery_days: int = 7

class ProductResponse(BaseModel):
    id: str
    vendor_id: str
    vendor_name: str
    vendor_rating: float
    category_id: str
    category_name: str
    name: str
    description: str
    price: float
    unit: str
    images: List[str]
    sustainability: SustainabilityMetrics
    stock_quantity: int
    delivery_days: int

class CartItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_id: str
    quantity: int
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = 1

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total_price: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    vendor_id: str
    items: List[OrderItem]
    total_amount: float
    delivery_address: str
    status: OrderStatus = OrderStatus.PENDING
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    items: List[dict]  # [{product_id, quantity}]
    delivery_address: str

class OrderResponse(BaseModel):
    id: str
    user_id: str
    vendor_id: str
    vendor_name: str
    items: List[OrderItem]
    total_amount: float
    delivery_address: str
    status: OrderStatus
    created_at: datetime
    updated_at: datetime

# ==================== AUTHENTICATION HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Construction Materials Marketplace API", "version": "1.0.0"}

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/signup", response_model=UserResponse)
async def signup(user_data: UserCreate):
    # Check if username exists
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create user
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    # Generate token
    token = create_token(user.id, user.role.value)
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        token=token
    )

@api_router.post("/auth/login", response_model=UserResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"username": credentials.username}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['role'])
    
    return UserResponse(
        id=user['id'],
        username=user['username'],
        email=user.get('email'),
        role=user['role'],
        token=token
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user['id'],
        username=current_user['username'],
        email=current_user.get('email'),
        role=current_user['role']
    )

# ==================== VENDOR ROUTES ====================

@api_router.post("/vendors/signup", response_model=VendorResponse)
async def create_vendor(vendor_data: VendorCreate, current_user: dict = Depends(get_current_user)):
    # Check if user already has a vendor profile
    existing_vendor = await db.vendors.find_one({"user_id": current_user['id']})
    if existing_vendor:
        raise HTTPException(status_code=400, detail="Vendor profile already exists")
    
    vendor = Vendor(
        user_id=current_user['id'],
        business_name=vendor_data.business_name,
        business_type=vendor_data.business_type,
        location=vendor_data.location,
        gst_number=vendor_data.gst_number,
        phone=vendor_data.phone
    )
    
    doc = vendor.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.vendors.insert_one(doc)
    
    return VendorResponse(**vendor.model_dump())

@api_router.get("/vendors/{vendor_id}", response_model=VendorResponse)
async def get_vendor(vendor_id: str):
    vendor = await db.vendors.find_one({"id": vendor_id}, {"_id": 0})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return VendorResponse(**vendor)

@api_router.get("/vendors/me/profile", response_model=VendorResponse)
async def get_my_vendor_profile(current_user: dict = Depends(get_current_user)):
    vendor = await db.vendors.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    return VendorResponse(**vendor)

# ==================== CATEGORY ROUTES ====================

@api_router.get("/categories", response_model=List[CategoryResponse])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return [CategoryResponse(**cat) for cat in categories]

# ==================== PRODUCT ROUTES ====================

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(
    category_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_sustainable: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 50
):
    query = {}
    
    if category_id:
        query['category_id'] = category_id
    
    if min_price is not None or max_price is not None:
        query['price'] = {}
        if min_price is not None:
            query['price']['$gte'] = min_price
        if max_price is not None:
            query['price']['$lte'] = max_price
    
    if is_sustainable:
        query['$or'] = [
            {'sustainability.is_recycled': True},
            {'sustainability.is_low_carbon': True},
            {'sustainability.is_energy_efficient': True}
        ]
    
    if search:
        query['$text'] = {'$search': search}
    
    products = await db.products.find(query, {"_id": 0}).limit(limit).to_list(limit)
    
    # Enrich with vendor and category info
    result = []
    for product in products:
        vendor = await db.vendors.find_one({"id": product['vendor_id']}, {"_id": 0})
        category = await db.categories.find_one({"id": product['category_id']}, {"_id": 0})
        
        result.append(ProductResponse(
            **product,
            vendor_name=vendor['business_name'] if vendor else "Unknown",
            vendor_rating=vendor['rating'] if vendor else 0.0,
            category_name=category['name'] if category else "Unknown"
        ))
    
    return result

@api_router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    vendor = await db.vendors.find_one({"id": product['vendor_id']}, {"_id": 0})
    category = await db.categories.find_one({"id": product['category_id']}, {"_id": 0})
    
    return ProductResponse(
        **product,
        vendor_name=vendor['business_name'] if vendor else "Unknown",
        vendor_rating=vendor['rating'] if vendor else 0.0,
        category_name=category['name'] if category else "Unknown"
    )

@api_router.post("/products", response_model=ProductResponse)
async def create_product(product_data: ProductCreate, current_user: dict = Depends(get_current_user)):
    # Get vendor profile
    vendor = await db.vendors.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not vendor:
        raise HTTPException(status_code=403, detail="Only vendors can create products")
    
    if vendor['status'] != VendorStatus.VERIFIED:
        raise HTTPException(status_code=403, detail="Vendor must be verified to add products")
    
    product = Product(
        vendor_id=vendor['id'],
        **product_data.model_dump()
    )
    
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    
    category = await db.categories.find_one({"id": product.category_id}, {"_id": 0})
    
    return ProductResponse(
        **product.model_dump(),
        vendor_name=vendor['business_name'],
        vendor_rating=vendor['rating'],
        category_name=category['name'] if category else "Unknown"
    )

@api_router.get("/products/vendor/my-products", response_model=List[ProductResponse])
async def get_my_products(current_user: dict = Depends(get_current_user)):
    vendor = await db.vendors.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not vendor:
        raise HTTPException(status_code=403, detail="Vendor profile not found")
    
    products = await db.products.find({"vendor_id": vendor['id']}, {"_id": 0}).to_list(100)
    
    result = []
    for product in products:
        category = await db.categories.find_one({"id": product['category_id']}, {"_id": 0})
        result.append(ProductResponse(
            **product,
            vendor_name=vendor['business_name'],
            vendor_rating=vendor['rating'],
            category_name=category['name'] if category else "Unknown"
        ))
    
    return result

# ==================== CART ROUTES ====================

@api_router.post("/cart/add")
async def add_to_cart(item: CartItemCreate, current_user: dict = Depends(get_current_user)):
    # Check if product exists
    product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    existing_item = await db.cart_items.find_one({
        "user_id": current_user['id'],
        "product_id": item.product_id
    })
    
    if existing_item:
        # Update quantity
        await db.cart_items.update_one(
            {"id": existing_item['id']},
            {"$set": {"quantity": existing_item['quantity'] + item.quantity}}
        )
    else:
        # Add new item
        cart_item = CartItem(
            user_id=current_user['id'],
            product_id=item.product_id,
            quantity=item.quantity
        )
        doc = cart_item.model_dump()
        doc['added_at'] = doc['added_at'].isoformat()
        await db.cart_items.insert_one(doc)
    
    return {"message": "Item added to cart"}

@api_router.get("/cart")
async def get_cart(current_user: dict = Depends(get_current_user)):
    cart_items = await db.cart_items.find({"user_id": current_user['id']}, {"_id": 0}).to_list(100)
    
    result = []
    total = 0.0
    
    for item in cart_items:
        product = await db.products.find_one({"id": item['product_id']}, {"_id": 0})
        if product:
            item_total = product['price'] * item['quantity']
            total += item_total
            result.append({
                "cart_item_id": item['id'],
                "product": product,
                "quantity": item['quantity'],
                "item_total": item_total
            })
    
    return {"items": result, "total": total}

@api_router.delete("/cart/{cart_item_id}")
async def remove_from_cart(cart_item_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.cart_items.delete_one({"id": cart_item_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Item removed from cart"}

# ==================== ORDER ROUTES ====================

@api_router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    # Get cart items or use provided items
    items = []
    total_amount = 0.0
    vendor_id = None
    
    for item_data in order_data.items:
        product = await db.products.find_one({"id": item_data['product_id']}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_data['product_id']} not found")
        
        if vendor_id is None:
            vendor_id = product['vendor_id']
        elif vendor_id != product['vendor_id']:
            raise HTTPException(status_code=400, detail="All items must be from same vendor")
        
        item_total = product['price'] * item_data['quantity']
        total_amount += item_total
        
        items.append(OrderItem(
            product_id=product['id'],
            product_name=product['name'],
            quantity=item_data['quantity'],
            unit_price=product['price'],
            total_price=item_total
        ))
    
    order = Order(
        user_id=current_user['id'],
        vendor_id=vendor_id,
        items=items,
        total_amount=total_amount,
        delivery_address=order_data.delivery_address
    )
    
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.orders.insert_one(doc)
    
    # Clear cart
    await db.cart_items.delete_many({"user_id": current_user['id']})
    
    vendor = await db.vendors.find_one({"id": vendor_id}, {"_id": 0})
    
    return OrderResponse(
        **order.model_dump(),
        vendor_name=vendor['business_name'] if vendor else "Unknown"
    )

@api_router.get("/orders", response_model=List[OrderResponse])
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user['id']}, {"_id": 0}).to_list(100)
    
    result = []
    for order in orders:
        vendor = await db.vendors.find_one({"id": order['vendor_id']}, {"_id": 0})
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if isinstance(order['updated_at'], str):
            order['updated_at'] = datetime.fromisoformat(order['updated_at'])
        
        result.append(OrderResponse(
            **order,
            vendor_name=vendor['business_name'] if vendor else "Unknown"
        ))
    
    return result

@api_router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if user owns this order or is the vendor
    vendor = await db.vendors.find_one({"user_id": current_user['id']}, {"_id": 0})
    is_vendor = vendor and vendor['id'] == order['vendor_id']
    
    if order['user_id'] != current_user['id'] and not is_vendor and current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    vendor_info = await db.vendors.find_one({"id": order['vendor_id']}, {"_id": 0})
    
    if isinstance(order['created_at'], str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    if isinstance(order['updated_at'], str):
        order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    
    return OrderResponse(
        **order,
        vendor_name=vendor_info['business_name'] if vendor_info else "Unknown"
    )

@api_router.get("/orders/vendor/my-orders", response_model=List[OrderResponse])
async def get_vendor_orders(current_user: dict = Depends(get_current_user)):
    vendor = await db.vendors.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not vendor:
        raise HTTPException(status_code=403, detail="Vendor profile not found")
    
    orders = await db.orders.find({"vendor_id": vendor['id']}, {"_id": 0}).to_list(100)
    
    result = []
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if isinstance(order['updated_at'], str):
            order['updated_at'] = datetime.fromisoformat(order['updated_at'])
        
        result.append(OrderResponse(
            **order,
            vendor_name=vendor['business_name']
        ))
    
    return result

@api_router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: OrderStatus, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Only vendor or admin can update status
    vendor = await db.vendors.find_one({"user_id": current_user['id']}, {"_id": 0})
    is_vendor = vendor and vendor['id'] == order['vendor_id']
    
    if not is_vendor and current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Order status updated"}

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/vendors/pending", response_model=List[VendorResponse])
async def get_pending_vendors(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    vendors = await db.vendors.find({"status": VendorStatus.PENDING}, {"_id": 0}).to_list(100)
    return [VendorResponse(**vendor) for vendor in vendors]

@api_router.patch("/admin/vendors/{vendor_id}/verify")
async def verify_vendor(vendor_id: str, approved: bool, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    new_status = VendorStatus.VERIFIED if approved else VendorStatus.REJECTED
    
    result = await db.vendors.update_one(
        {"id": vendor_id},
        {"$set": {"status": new_status.value}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    return {"message": f"Vendor {new_status.value}"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()