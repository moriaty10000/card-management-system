from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.parse

# 使用 Redis 存储
REDIS_URL = os.getenv("REDIS_URL")

if REDIS_URL:
    import redis
    r = redis.from_url(REDIS_URL, decode_responses=True)
    USE_REDIS = True
else:
    USE_REDIS = False
    _memory_store = {}

def get_data(key):
    if USE_REDIS:
        data = r.get(key)
        if data:
            return json.loads(data)
        return [] if 'list' in key else 1
    else:
        return _memory_store.get(key, [] if 'list' in key else 1)

def set_data(key, value):
    if USE_REDIS:
        r.set(key, json.dumps(value, ensure_ascii=False))
    else:
        _memory_store[key] = value

class handler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        path = self.path
        
        if path == '/api/cards':
            cards = get_data("cards_list") or []
            self._set_headers()
            self.wfile.write(json.dumps(cards).encode())
        elif path == '/api/categories':
            categories = get_data("categories_list") or []
            self._set_headers()
            self.wfile.write(json.dumps(categories).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        path = self.path
        
        if path == '/api/cards':
            cards = get_data("cards_list") or []
            next_id = get_data("next_card_id") or 1
            
            from datetime import datetime
            now = datetime.utcnow().isoformat() + 'Z'
            
            new_card = {
                "id": next_id,
                "title": data.get("title", ""),
                "content": data.get("content", ""),
                "is_favorite": data.get("is_favorite", False),
                "category_id": data.get("category_id"),
                "created_at": now,
                "updated_at": now
            }
            cards.append(new_card)
            set_data("cards_list", cards)
            set_data("next_card_id", next_id + 1)
            
            self._set_headers()
            self.wfile.write(json.dumps(new_card).encode())
            
        elif path == '/api/categories':
            categories = get_data("categories_list") or []
            next_id = get_data("next_category_id") or 1
            
            new_category = {
                "id": next_id,
                "name": data.get("name", "")
            }
            categories.append(new_category)
            set_data("categories_list", categories)
            set_data("next_category_id", next_id + 1)
            
            self._set_headers()
            self.wfile.write(json.dumps(new_category).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_PUT(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        # Extract ID from path like /api/cards/1 or /api/categories/1
        path_parts = self.path.split('/')
        if len(path_parts) >= 4:
            resource_type = path_parts[2]
            resource_id = int(path_parts[3])
            
            if resource_type == 'cards':
                cards = get_data("cards_list") or []
                
                from datetime import datetime
                now = datetime.utcnow().isoformat() + 'Z'
                
                for card in cards:
                    if card['id'] == resource_id:
                        if 'title' in data:
                            card['title'] = data['title']
                        if 'content' in data:
                            card['content'] = data['content']
                        if 'is_favorite' in data:
                            card['is_favorite'] = data['is_favorite']
                        if 'category_id' in data:
                            card['category_id'] = data['category_id']
                        
                        # 更新时间戳
                        card['updated_at'] = now
                        
                        set_data("cards_list", cards)
                        self._set_headers()
                        self.wfile.write(json.dumps(card).encode())
                        return
                
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Card not found"}).encode())
                
            elif resource_type == 'categories':
                categories = get_data("categories_list") or []
                
                for category in categories:
                    if category['id'] == resource_id:
                        if 'name' in data:
                            category['name'] = data['name']
                        
                        set_data("categories_list", categories)
                        self._set_headers()
                        self.wfile.write(json.dumps(category).encode())
                        return
                
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Category not found"}).encode())
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Not found"}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_DELETE(self):
        path_parts = self.path.split('/')
        if len(path_parts) >= 4:
            resource_type = path_parts[2]
            resource_id = int(path_parts[3])
            
            if resource_type == 'cards':
                cards = get_data("cards_list") or []
                cards = [c for c in cards if c['id'] != resource_id]
                set_data("cards_list", cards)
                
                self._set_headers()
                self.wfile.write(json.dumps({"ok": True}).encode())
                
            elif resource_type == 'categories':
                categories = get_data("categories_list") or []
                categories = [c for c in categories if c['id'] != resource_id]
                set_data("categories_list", categories)
                
                self._set_headers()
                self.wfile.write(json.dumps({"ok": True}).encode())
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Not found"}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
