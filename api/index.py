from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 使用 JSON 文件存储（Vercel 不支持 SQLite）
DATA_FILE = "/tmp/cards_data.json"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"cards": [], "categories": [], "next_card_id": 1, "next_category_id": 1}

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

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
    data = load_data()
    
    # Check if category exists
    if any(c['name'] == category.name for c in data['categories']):
        raise HTTPException(status_code=400, detail="Category already exists")
    
    new_category = {
        "id": data['next_category_id'],
        "name": category.name
    }
    data['categories'].append(new_category)
    data['next_category_id'] += 1
    save_data(data)
    
    return new_category

@app.get("/api/categories", response_model=List[CategoryResponse])
def read_categories():
    data = load_data()
    return data['categories']

@app.post("/api/cards", response_model=CardResponse)
def create_card(card: CardCreate):
    data = load_data()
    
    new_card = {
        "id": data['next_card_id'],
        "title": card.title,
        "content": card.content,
        "is_favorite": card.is_favorite,
        "category_id": card.category_id
    }
    data['cards'].append(new_card)
    data['next_card_id'] += 1
    save_data(data)
    
    return new_card

@app.get("/api/cards", response_model=List[CardResponse])
def read_cards():
    data = load_data()
    return data['cards']

@app.put("/api/cards/{card_id}", response_model=CardResponse)
def update_card(card_id: int, card: CardUpdate):
    data = load_data()
    
    card_index = next((i for i, c in enumerate(data['cards']) if c['id'] == card_id), None)
    if card_index is None:
        raise HTTPException(status_code=404, detail="Card not found")
    
    update_data = card.dict(exclude_unset=True)
    data['cards'][card_index].update(update_data)
    save_data(data)
    
    return data['cards'][card_index]

@app.delete("/api/cards/{card_id}")
def delete_card(card_id: int):
    data = load_data()
    
    card_index = next((i for i, c in enumerate(data['cards']) if c['id'] == card_id), None)
    if card_index is None:
        raise HTTPException(status_code=404, detail="Card not found")
    
    data['cards'].pop(card_index)
    save_data(data)
    
    return {"ok": True}

# Vercel serverless function handler
from mangum import Mangum
handler = Mangum(app)
