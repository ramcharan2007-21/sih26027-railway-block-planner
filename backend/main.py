import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes import trains, assets, sections, maintenance, blocks, optimizer, conflicts, analytics, auth, demo

app = FastAPI(
    title="IR-BlockPlan AI - Indian Railways Automatic Block Planning System",
    description="Smart India Hackathon 2026 (SIH26027) - AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways",
    version="1.0.0"
)

# CORS setup for local development and frontend client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(trains.router)
app.include_router(assets.router)
app.include_router(sections.router)
app.include_router(maintenance.router)
app.include_router(blocks.router)
app.include_router(optimizer.router)
app.include_router(conflicts.router)
app.include_router(analytics.router)
app.include_router(demo.router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {
        "system": "IR-BlockPlan AI",
        "organization": "Ministry of Railways / Indian Railways",
        "hackathon": "Smart India Hackathon 2026 (SIH26027)",
        "status": "Operational",
        "api_docs": "/docs",
        "demo_scenario": "/api/demo/scenario"
    }

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "IR-BlockPlan AI Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
