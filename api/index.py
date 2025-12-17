import os
import sys
import json
import traceback
from http.server import BaseHTTPRequestHandler

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Fallback Handler that depends on NOTHING external
class FallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(500)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response = {
            "status": "critical_error",
            "message": "Application failed to initialize",
            "traceback": error_trace.splitlines() if error_trace else "Unknown error"
        }
        self.wfile.write(json.dumps(response, indent=2).encode())
    
    def do_POST(self): self.do_GET()
    def do_PUT(self): self.do_GET()
    def do_DELETE(self): self.do_GET()
    def do_OPTIONS(self): self.do_GET()

error_trace = None

try:
    # 1. Attempt strict environment setup
    if not os.getenv("DATABASE_URL") and not os.getenv("POSTGRES_URL"):
        os.environ["DATABASE_URL"] = "sqlite:////tmp/cards_v2.db"

    # 2. Attempt to import main application
    from backend.main import app
    from mangum import Mangum

    # 3. Create normal handler
    handler = Mangum(app)

except Exception:
    # 4. Catch ANY crash during import (syntax, missing lib, db connect fail)
    error_trace = traceback.format_exc()
    handler = FallbackHandler
