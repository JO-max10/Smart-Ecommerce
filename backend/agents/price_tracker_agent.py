import os
import json
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

logger = logging.getLogger("PriceTrackerAgent")

class PriceHistoryPoint(BaseModel):
    date: str
    price: float
    store: str

class ProductPriceAnalysis(BaseModel):
    product_id: str
    current_price: float
    list_price: float
    all_time_low: float
    all_time_high: float
    average_90d: float
    savings_vs_list: float
    savings_vs_avg: float
    price_drop_pct: float
    is_all_time_low: bool
    is_near_all_time_low: bool
    deal_rating: str
    deal_score: int # 1 to 100
    recommendation: str
    history: List[PriceHistoryPoint]

class PriceAlertItem(BaseModel):
    alert_id: str
    product_id: str
    product_name: str
    target_price: float
    current_price: float
    user_email: Optional[str] = "user@example.com"
    created_at: str
    is_triggered: bool
    status_message: str

class PriceTrackerAgent:
    """
    Agent 4: Price Drop & Deal Tracking Agent.
    Monitors historical pricing curves, calculates discount velocity,
    flags All-Time Lows, and manages price alerts.
    """
    def __init__(self, history_file: Optional[str] = None):
        self.name = "Price Drop & History Tracker Agent"
        self.role = "Price History Analysis & Deal Quality Scoring"
        if not history_file:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            history_file = os.path.join(base_dir, "data", "price_history.json")
        self.history_file = history_file
        self.history_data: Dict[str, Any] = {}
        self.active_alerts: List[PriceAlertItem] = []
        self._load_history()

    def _load_history(self):
        try:
            with open(self.history_file, "r", encoding="utf-8") as f:
                self.history_data = json.load(f)
        except Exception as e:
            logger.error(f"Error loading price history: {e}")
            self.history_data = {}

    def analyze_price(self, product_id: str, current_lowest_price: float, list_price: float) -> ProductPriceAnalysis:
        """
        Calculates deal metrics and price drops comparing real-time price against 90-day history.
        """
        history_record = self.history_data.get(product_id, {})
        atl = float(history_record.get("all_time_low", current_lowest_price * 0.95))
        ath = float(history_record.get("all_time_high", list_price))
        avg_90d = float(history_record.get("average_90d", (current_lowest_price + list_price) / 2))
        
        # If current price is actually lower than recorded ATL, update ATL
        if current_lowest_price < atl:
            atl = current_lowest_price

        savings_vs_list = round(list_price - current_lowest_price, 2)
        savings_vs_avg = round(avg_90d - current_lowest_price, 2)
        discount_pct = round(((list_price - current_lowest_price) / list_price) * 100, 1) if list_price > 0 else 0.0

        is_atl = current_lowest_price <= (atl + 1.0)
        is_near_atl = current_lowest_price <= (atl * 1.05)

        # Compute Deal Quality Rating
        if is_atl and discount_pct >= 20.0:
            deal_rating = "🔥 Historic All-Time Low"
            deal_score = 98
            recommendation = "Immediate Buy: Best price ever recorded in 90 days."
        elif is_atl:
            deal_rating = "⚡ All-Time Low"
            deal_score = 93
            recommendation = "Great time to purchase: Matches lowest historical price."
        elif savings_vs_avg > 50.0:
            deal_rating = "🏷️ Deep Discount vs Average"
            deal_score = 88
            recommendation = f"Save ${savings_vs_avg:.0f} compared to the 90-day average price."
        elif discount_pct >= 10.0:
            deal_rating = "👍 Solid Deal"
            deal_score = 80
            recommendation = "Good discount from MSRP; price has been dropping recently."
        else:
            deal_rating = "Standard Market Price"
            deal_score = 65
            recommendation = "Fair price, but price tracking is active for upcoming drops."

        # Parse timeline points
        timeline_raw = history_record.get("timeline", [])
        timeline_pts = [
            PriceHistoryPoint(date=p["date"], price=float(p["price"]), store=p.get("store", "Retailer"))
            for p in timeline_raw
        ]

        return ProductPriceAnalysis(
            product_id=product_id,
            current_price=current_lowest_price,
            list_price=list_price,
            all_time_low=atl,
            all_time_high=ath,
            average_90d=avg_90d,
            savings_vs_list=savings_vs_list,
            savings_vs_avg=savings_vs_avg,
            price_drop_pct=discount_pct,
            is_all_time_low=is_atl,
            is_near_all_time_low=is_near_atl,
            deal_rating=deal_rating,
            deal_score=deal_score,
            recommendation=recommendation,
            history=timeline_pts
        )

    def create_alert(self, product_id: str, product_name: str, target_price: float, current_price: float, user_email: str = "user@example.com") -> PriceAlertItem:
        import uuid
        from datetime import datetime
        
        is_triggered = current_price <= target_price
        diff = target_price - current_price
        
        if is_triggered:
            status_msg = f"Target met! Current price ${current_price:.2f} is already at or below your ${target_price:.2f} target."
        else:
            status_msg = f"Alert active! We will notify you when price drops by ${-diff:.2f} to hit ${target_price:.2f}."

        alert = PriceAlertItem(
            alert_id=f"alt_{str(uuid.uuid4())[:8]}",
            product_id=product_id,
            product_name=product_name,
            target_price=target_price,
            current_price=current_price,
            user_email=user_email,
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M"),
            is_triggered=is_triggered,
            status_message=status_msg
        )
        self.active_alerts.append(alert)
        return alert

    def get_alerts(self) -> List[PriceAlertItem]:
        return self.active_alerts
