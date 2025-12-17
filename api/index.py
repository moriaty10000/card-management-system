from mangum import Mangum
from backend.main import app

# Create the handler for Vercel (AWS Lambda compatible adapter)
handler = Mangum(app)
