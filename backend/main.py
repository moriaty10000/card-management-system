from fastapi import FastAPI, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship, joinedload
from fastapi.middleware.cors import CORSMiddleware
import os
import traceback

# Database Setup
# Vercel Postgres provides POSTGRES_URL, ensure it starts with postgresql:// for SQLAlchemy
database_url = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL") or "sqlite:///./cards_v2.db"
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+pg8000://", 1)

SQLALCHEMY_DATABASE_URL = database_url

connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif "pg8000" in SQLALCHEMY_DATABASE_URL:
    try:
        import ssl
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        connect_args["ssl_context"] = ssl_context
    except Exception as e:
        print(f"SSL Context creation failed: {e}")

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    color = Column(String, default="gold")
    cards = relationship("Card", back_populates="category")

class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    is_favorite = Column(Boolean, default=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", back_populates="cards")
    created_at = Column(String, default="")
    updated_at = Column(String, default="")

# Seed data function
def seed_data():
    db = SessionLocal()
    try:
        if db.query(Category).count() == 0:
            default_categories = [
                Category(name='10000', color='blue'),
                Category(name='Ry', color='crimson'),
                Category(name='Fit', color='emerald')
            ]
            db.add_all(default_categories)
            db.commit()
        if db.query(Card).count() == 0:
            from datetime import datetime
            now = datetime.utcnow().isoformat() + 'Z'
            sample_card = Card(
                title='示例卡片', 
                content='这是一条示例内容。', 
                is_favorite=False,
                created_at=now,
                updated_at=now
            )
            db.add(sample_card)
            db.commit()
    except Exception as e:
        print(f"Seed data error: {e}")
    finally:
        db.close()

# Pydantic Schemas
class CategoryBase(BaseModel):
    name: str
    color: str = "gold"

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    class Config:
        from_attributes = True

class CardBase(BaseModel):
    title: str
    content: str
    is_favorite: bool = False
    category_id: Optional[int] = None

class CardCreate(BaseModel):
    title: str
    content: str
    is_favorite: bool = False
    category_id: Optional[int] = None

class CardUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_favorite: Optional[bool] = None
    category_id: Optional[int] = None

class CardResponse(CardBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    category: Optional[CategoryResponse] = None
    class Config:
        from_attributes = True

# Initialize API
app = FastAPI()

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event
@app.on_event("startup")
def startup_db():
    try:
        # Create tables on startup
        # Verify engine connection first
        with engine.connect() as conn:
            pass
        Base.metadata.create_all(bind=engine)
        seed_data()
    except Exception as e:
        print(f"Startup DB Error: {e}")
        # Log error but allow app to start so /api/health works

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes
@app.post("/api/categories", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.name == category.name).first()
    if db_category:
        raise HTTPException(status_code=400, detail="Category already exists")
    new_category = Category(name=category.name, color=category.color)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@app.put("/api/categories/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category: CategoryCreate, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db_category.name = category.name
    db_category.color = category.color
    db.commit()
    db.refresh(db_category)
    return db_category

@app.delete("/api/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return {"ok": True}

@app.get("/api/categories", response_model=List[CategoryResponse])
def read_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@app.post("/api/cards", response_model=CardResponse)
def create_card(card: CardCreate, db: Session = Depends(get_db)):
    from datetime import datetime
    now = datetime.utcnow().isoformat() + 'Z'
    new_card = Card(**card.dict(), created_at=now, updated_at=now)
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    # Eager load category to include in response
    db_card = db.query(Card).options(joinedload(Card.category)).filter(Card.id == new_card.id).first()
    return db_card

@app.get("/api/cards", response_model=List[CardResponse])
def read_cards(db: Session = Depends(get_db)):
    return db.query(Card).options(joinedload(Card.category)).all()

@app.put("/api/cards/{card_id}", response_model=CardResponse)
def update_card(card_id: int, card: CardUpdate, db: Session = Depends(get_db)):
    db_card = db.query(Card).filter(Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    from datetime import datetime
    now = datetime.utcnow().isoformat() + 'Z'
    
    update_data = card.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_card, key, value)
    
    db_card.updated_at = now
    db.commit()
    # Eager load category to include in response
    db_card = db.query(Card).options(joinedload(Card.category)).filter(Card.id == card_id).first()
    return db_card

@app.delete("/api/cards/{card_id}")
def delete_card(card_id: int, db: Session = Depends(get_db)):
    db_card = db.query(Card).filter(Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    db.delete(db_card)
    db.commit()
    return {"ok": True}

# Serve static files (for production)
if os.path.exists("backend/static"):
    app.mount("/assets", StaticFiles(directory="backend/static/assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Serve index.html for all non-API routes
        if not full_path.startswith("api"):
            return FileResponse("backend/static/index.html")

# Global Exception Handler for Debugging (Temporary)
@app.exception_handler(Exception)
async def debug_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal Server Error",
            "detail": str(exc),
            "traceback": traceback.format_exc().splitlines()
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
