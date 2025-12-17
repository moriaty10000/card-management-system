import os
import sys
import traceback
import json
from http.server import BaseHTTPRequestHandler

# Add the project root to sys.path to ensure backend can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup ENV for database if missing (fallback logic)
if not os.getenv("DATABASE_URL") and not os.getenv("POSTGRES_URL"):
    os.environ["DATABASE_URL"] = "sqlite:////tmp/cards_v2.db"

# Try to import the app
try:
    from backend.main import app
    from mangum import Mangum
    
    # Create the handler for Vercel (AWS Lambda compatible adapter)
    handler = Mangum(app)

except Exception as e:
    # DEBUG MODE: If app fails to load (e.g. database connection error),
    # return a 500 error with the traceback so we can see what's wrong.
    
    error_trace = traceback.format_exc()
    
    class DebugHandler(BaseHTTPRequestHandler):
        def do_message(self):
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "status": "error",
                "message": "Backend failed to start",
                "detail": str(e),
                "traceback": error_trace.splitlines()
            }
            self.wfile.write(json.dumps(response, indent=2).encode())
            
        def do_GET(self): self.do_message()
        def do_POST(self): self.do_message()
        def do_PUT(self): self.do_message()
        def do_DELETE(self): self.do_message()
        def do_OPTIONS(self): self.do_message()
        
    handler = DebugHandler
