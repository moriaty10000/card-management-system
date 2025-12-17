import os
import sys

# Add the project root to sys.path to ensure backend can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Vercel Serverless environment usually has read-only filesystem except /tmp
# Set DATABASE_URL to a temporary sqlite path if not set, to avoid "readonly database" errors
if not os.getenv("DATABASE_URL"):
    # Determine if we are running in a Vercel-like environment (or just use /tmp for safety on this entry point)
    # On Vercel, it is Linux.
    os.environ["DATABASE_URL"] = "sqlite:////tmp/cards_v2.db"

try:
    from backend.main import app
    from mangum import Mangum
except ImportError:
    # If dependencies are missing (e.g. locally without mangum installed), this might fail.
    # But on Vercel it should work if requirements.txt is correct.
    raise

# Create the handler for Vercel (AWS Lambda compatible adapter)
handler = Mangum(app)
