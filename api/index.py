import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set dummy DB URL if missing to prevent pure-connection crashes before main logic
if not os.getenv("DATABASE_URL") and not os.getenv("POSTGRES_URL"):
    os.environ["DATABASE_URL"] = "sqlite:////tmp/cards_v2.db"

# Import the FastAPI app
try:
    from backend.main import app
except Exception as e:
    # If imports fail (e.g. missing dependencies), create a dummy app to display the error
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    import traceback
    
    app = FastAPI()
    
    @app.get("/api/{catchall:path}")
    async def import_error(catchall: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "ImportError", 
                "detail": str(e),
                "traceback": traceback.format_exc().splitlines()
            }
        )
