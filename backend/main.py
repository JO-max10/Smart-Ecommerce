import os
from typing import Optional
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .agents.orchestrator import ShoppingOrchestrator
from .agents.recommendation_agent import RecommendationReport

app = FastAPI(
    title="Smart E-Commerce Multi-Agent Shopping Assistant API",
    description="Multi-agent shopping bot featuring Playwright browser automation, Vector DB spec search, and price drop tracking.",
    version="2.0.0"
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = ShoppingOrchestrator()

class SearchRequest(BaseModel):
    query: str
    max_budget: Optional[float] = None

class AlertRequest(BaseModel):
    product_id: str
    product_name: str
    target_price: float
    current_price: float
    user_email: Optional[str] = "user@example.com"

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Smart E-Commerce Multi-Agent Assistant",
        "active_agents": [
            "Preference & Intent Understanding Agent",
            "Playwright Browser Scraper Agent",
            "Vector Database Spec Agent",
            "Price Drop & Deal Tracker Agent",
            "Review Synthesis & Recommendation Agent"
        ],
        "indexed_products": len(orchestrator.vector_agent.product_ids),
        "version": "2.0.0"
    }

@app.post("/api/search", response_model=RecommendationReport)
async def execute_search(req: SearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    report = await orchestrator.run(req.query)
    return report

@app.get("/api/stream-search")
async def stream_search(query: str = Query(..., min_length=2)):
    """
    Streams live Server-Sent Events (SSE) showcasing each agent's execution,
    thoughts, and vector calculations in real time.
    """
    return StreamingResponse(
        orchestrator.stream_pipeline(query),
        media_type="text/event-stream"
    )

@app.get("/api/catalog")
def get_catalog():
    return orchestrator.scraper_agent.local_catalog

@app.get("/api/price-history/{product_id}")
def get_price_history(product_id: str):
    history = orchestrator.price_agent.history_data.get(product_id)
    if not history:
        raise HTTPException(status_code=404, detail="Product price history not found")
    return history

@app.post("/api/watchlist")
def add_price_alert(alert: AlertRequest):
    created_alert = orchestrator.price_agent.create_alert(
        product_id=alert.product_id,
        product_name=alert.product_name,
        target_price=alert.target_price,
        current_price=alert.current_price,
        user_email=alert.user_email
    )
    return {
        "status": "success",
        "alert": created_alert
    }

@app.get("/api/watchlist")
def get_watchlist():
    return orchestrator.price_agent.get_alerts()

# Mount frontend static directory
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
if os.path.isdir(frontend_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dir, "assets")), name="assets")
    app.mount("/css", StaticFiles(directory=os.path.join(frontend_dir, "css")), name="css")
    app.mount("/js", StaticFiles(directory=os.path.join(frontend_dir, "js")), name="js")

    @app.get("/")
    def serve_frontend_root():
        index_file = os.path.join(frontend_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "Frontend index.html not found"}
