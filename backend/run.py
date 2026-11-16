import sys
import os

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn
from app.seed import seed_database
from app.main import app

if __name__ == "__main__":
    seed_database()
    # Running without watchfiles reloader ensures rock-solid stability in background processes
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info"
    )
