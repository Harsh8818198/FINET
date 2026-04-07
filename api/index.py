import os
import sys

# 1. Calculate paths
# api/index.py -> api/ -> project_root/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVER_DIR = os.path.join(BASE_DIR, "server")

# 2. Add both root and server to sys.path
# This ensures that 'import server.main' works AND 'import intelligence_engine' (inside main) works
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)
if SERVER_DIR not in sys.path:
    sys.path.append(SERVER_DIR)

# 3. Explicitly import and expose the FastAPI app
try:
    from server.main import app
except ImportError as e:
    # If the above fails, try importing directly if we are already in the server context
    try:
        from main import app
    except ImportError:
        raise e

# Vercel looks for 'app' at the top level of this file
# We've imported it above, so it is now available as api.index.app
