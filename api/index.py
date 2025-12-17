import os
import sys
import traceback
import json

# Add the project root to sys.path to ensure backend can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup ENV for database if missing (fallback logic)
if not os.getenv("DATABASE_URL") and not os.getenv("POSTGRES_URL"):
    os.environ["DATABASE_URL"] = "sqlite:////tmp/cards_v2.db"

# ASGI Debug App
async def debug_app(scope, receive, send):
    error_trace = traceback.format_exc()
    error_msg = json.dumps({
        "status": "error",
        "message": "Backend failed to start",
        "detail": str(startup_error),
        "traceback": error_trace.splitlines()
    }, indent=2)
    
    await send({
        'type': 'http.response.start',
        'status': 500,
        'headers': [
            (b'content-type', b'application/json'),
            (b'access-control-allow-origin', b'*'),
        ],
    })
    await send({
        'type': 'http.response.body',
        'body': error_msg.encode('utf-8'),
    })

startup_error = None

# Try to import the app
try:
    from backend.main import app
    # Vercel will look for 'app' variable by default for ASGI
except Exception as e:
    startup_error = e
    app = debug_app
