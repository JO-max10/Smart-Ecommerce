import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class ParsedIntent(BaseModel):
    raw_query: str
    category: str
    target_item: str
    budget_max: Optional[float] = None
    budget_min: Optional[float] = None
    priorities: Dict[str, str] = Field(default_factory=dict)
    use_cases: List[str] = Field(default_factory=list)
    technical_constraints: Dict[str, Any] = Field(default_factory=dict)
    search_keywords: List[str] = Field(default_factory=list)
    confidence_score: float = 0.95
    agent_reasoning: List[str] = Field(default_factory=list)

class IntentUnderstandingAgent:
    """
    Agent 1: Understands nuanced user preferences and converts unstructured
    natural language requests into high-fidelity technical and pricing constraints.
    """
    def __init__(self):
        self.name = "Preference Understanding Agent"
        self.role = "Semantic Intent & Nuance Parser"

    def analyze(self, query: str) -> ParsedIntent:
        query_lower = query.lower().strip()
        reasoning = []
        
        # 1. Category Detection
        category = "laptops" # default fallback
        target_item = "laptop"
        if any(term in query_lower for term in ["headphone", "headphones", "earbuds", "anc", "audio", "sound"]):
            category = "headphones"
            target_item = "noise cancelling headphones"
            reasoning.append("Detected category 'headphones' from query terms.")
        elif any(term in query_lower for term in ["monitor", "display", "screen", "4k", "ultrawide", "panel"]):
            category = "monitors"
            target_item = "4K productivity monitor"
            reasoning.append("Detected category 'monitors' from query terms.")
        elif any(term in query_lower for term in ["laptop", "ultrabook", "notebook", "macbook", "thinkpad", "computer"]):
            category = "laptops"
            target_item = "lightweight ultrabook laptop"
            reasoning.append("Detected category 'laptops' from query terms.")
        else:
            reasoning.append("Defaulted to 'laptops' based on specification query context.")

        # 2. Budget Extraction (e.g. "under $1000", "< 1000", "below 1200", "$500 to $800")
        budget_max = None
        budget_min = None

        range_match = re.search(r'\$?(\d+)\s*(?:-|to|–)\s*\$?(\d+)', query_lower)
        if range_match:
            budget_min = float(range_match.group(1))
            budget_max = float(range_match.group(2))
            reasoning.append(f"Extracted price range: ${budget_min} - ${budget_max}.")
        else:
            under_match = re.search(r'(?:under|below|less\s+than|<|max(?:imum)?\s+of)\s*\$?(\d+(?:\.\d+)?)', query_lower)
            if under_match:
                budget_max = float(under_match.group(1))
                reasoning.append(f"Identified strict budget ceiling: ${budget_max:.2f}.")
            else:
                price_match = re.search(r'\$(\d+(?:\.\d+)?)', query_lower)
                if price_match:
                    budget_max = float(price_match.group(1))
                    reasoning.append(f"Inferred target budget: ${budget_max:.2f}.")

        # 3. Nuance & Use-Case Extraction
        use_cases = []
        priorities = {}
        technical_constraints: Dict[str, Any] = {}

        # Coding / Development intent
        if any(w in query_lower for w in ["code", "coding", "developer", "programming", "docker", "python", "software", "terminal"]):
            use_cases.append("software_engineering")
            priorities["ram"] = "CRITICAL"
            priorities["cpu"] = "HIGH"
            priorities["keyboard"] = "HIGH"
            technical_constraints["min_ram_gb"] = 16
            technical_constraints["recommended_cpus"] = ["M3", "Core Ultra 7", "Ryzen 7 PRO", "Core Ultra 5"]
            reasoning.append("Flagged 'Coding / Development' use-case: Enforced minimum 16GB RAM for containers/IDEs.")

        # Lightweight / Portability
        if any(w in query_lower for w in ["light", "lightweight", "portable", "travel", "commute", "slim", "thin"]):
            use_cases.append("portability")
            priorities["weight"] = "CRITICAL"
            technical_constraints["max_weight_lbs"] = 3.2
            reasoning.append("Detected 'Lightweight' requirement: Enforcing sub-3.2 lbs weight constraint.")

        # Battery Life
        if any(w in query_lower for w in ["battery", "all-day", "long battery", "runtime", "hours"]):
            use_cases.append("all_day_battery")
            priorities["battery"] = "CRITICAL"
            technical_constraints["min_battery_hours"] = 12.0
            reasoning.append("Detected 'Great Battery Life': Requiring >= 12 hours tested runtime.")

        # Display & Ergonomics
        if any(w in query_lower for w in ["oled", "screen", "display", "resolution", "4k", "color", "retina"]):
            use_cases.append("display_clarity")
            priorities["display"] = "HIGH"
            reasoning.append("Prioritizing high resolution and eye-comfort display panel.")

        # Active Noise Cancellation (ANC)
        if any(w in query_lower for w in ["noise", "cancelling", "anc", "quiet", "flight", "plane", "travel"]):
            use_cases.append("anc_commute")
            priorities["anc"] = "CRITICAL"
            reasoning.append("Prioritizing class-leading active noise cancellation for quiet focus.")

        # Generate targeted multi-store search queries
        search_keywords = []
        if category == "laptops":
            base_kw = "lightweight ultrabook 16gb ram"
            if budget_max:
                search_keywords.append(f"{base_kw} under {int(budget_max)}")
            search_keywords.append("laptop long battery life coding")
            search_keywords.append("portable developer laptop")
        elif category == "headphones":
            search_keywords.append("wireless noise cancelling headphones anc")
            if budget_max:
                search_keywords.append(f"best anc headphones under {int(budget_max)}")
        elif category == "monitors":
            search_keywords.append("4k uhd usb-c ips monitor coding")
            if budget_max:
                search_keywords.append(f"4k monitor under {int(budget_max)}")

        return ParsedIntent(
            raw_query=query,
            category=category,
            target_item=target_item,
            budget_max=budget_max,
            budget_min=budget_min,
            priorities=priorities,
            use_cases=use_cases,
            technical_constraints=technical_constraints,
            search_keywords=search_keywords,
            confidence_score=0.96,
            agent_reasoning=reasoning
        )
