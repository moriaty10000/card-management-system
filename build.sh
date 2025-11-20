#!/bin/bash
# Build script for Render

# Install backend dependencies
pip install -r backend/requirements.txt

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Move frontend build to backend static folder
mkdir -p backend/static
cp -r frontend/dist/* backend/static/
