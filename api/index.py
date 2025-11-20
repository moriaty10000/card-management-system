from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 使用 Vercel KV 存储
try:
    from vercel_kv import kv
    USE_KV = True
except ImportError:
    USE_KV = False
    # Fallback to in-memory storage for local development
    _memory_store = {"cards": [], "categories": [], "next_card_id": 1, "next_category_id": 1}

def get_data(key):
    if USE_KV:
        data = kv.get(key)
        return data if data else ([] if 'list' in key else 1)
    else:
        return _memory_store.get(key, [] if 'list' in key else 1)

def set_data(key, value):
    if USE_KV:
        kv.set(key, value)
    else:
        _memory_store[key] = value

# Pydantic Schemas
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int

class CardBase(BaseModel):
    title: str
    content: str
    is_favorite: bool = False
    category_id: Optional[int] = None

class CardCreate(CardBase):
    pass

class CardUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_favorite: Optional[bool] = None
    category_id: Optional[int] = None

class CardResponse(CardBase):
    id: int

# Routes
@app.post("/api/categories", response_model=CategoryResponse)
def create_category(category: CategoryCreate):
    categories = get_data("categories_list") or []
    
    if any(c['name'] == category.name for c in categories):
        raise HTTPException(status_code=400, detail="Category already exists")
    
    next_id = get_data("next_category_id") or 1
    new_category = {
        "id": next_id,
        "name": category.name
    }
    categories.append(new_category)
    set_data("categories_list", categories)
    set_data("next_category_id", next_id + 1)
    
    return new_category

@app.get("/api/categories", response_model=List[CategoryResponse])
def read_categories():
    return get_data("categories_list") or []

@app.post("/api/cards", response_model=CardResponse)
def create_card(card: CardCreate):
    cards = get_data("cards_list") or []
    next_id = get_data("next_card_id") or 1
    
    new_card = {
        "id": next_id,
        "title": card.title,
        "content": card.content,
        "is_favorite": card.is_favorite,
        "category_id": card.category_id
    }
    cards.append(new_card)
    set_data("cards_list", cards)
    set_data("next_card_id", next_id + 1)
    
    return new_card

@app.get("/api/cards", response_model=List[CardResponse])
def read_cards():
    return get_data("cards_list") or []

@app.put("/api/cards/{card_id}", response_model=CardResponse)
def update_card(card_id: int, card: CardUpdate):
    cards = get_data("cards_list") or []
    
    card_index = next((i for i, c in enumerate(cards) if c['id'] == card_id), None)
    if card_index is None:
        raise HTTPException(status_code=404, detail="Card not found")
    
    update_data = card.dict(exclude_unset=True)
    cards[card_index].update(update_data)
    set_data("cards_list", cards)
    
    return cards[card_index]

@app.delete("/api/cards/{card_id}")
def delete_card(card_id: int):
    cards = get_data("cards_list") or []
    
    card_index = next((i for i, c in enumerate(cards) if c['id'] == card_id), None)
    if card_index is None:
        raise HTTPException(status_code=404, detail="Card not found")
    
    cards.pop(card_index)
    set_data("cards_list", cards)
    
    return {"ok": True}

# Vercel serverless function handler
from mangum import Mangum
handler = Mangum(app)
