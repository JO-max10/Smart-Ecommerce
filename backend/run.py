import uvicorn
import os
import sys

# Configure UTF-8 encoding for Windows standard out
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

if __name__ == "__main__":
    print("=" * 65)
    print(" Starting Smart E-Commerce Multi-Agent Assistant Server...")
    print(" Agents Active: PreferenceIntent, BrowserScraper, VectorSpec, PriceTracker, RecSynthesizer")
    print(" Access Web Interface: http://localhost:8000")
    print(" Interactive API Docs: http://localhost:8000/docs")
    print("=" * 65)
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)
