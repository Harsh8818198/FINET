import os
import sys

# Ensure the project root is in the Python path for Vercel
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)

# Bridge to the FastAPI app
try:
    from server.main import app
except ImportError:
    # Fallback for different Vercel structure variants
    sys.path.append(os.path.join(ROOT_DIR, "server"))
    from main import app
