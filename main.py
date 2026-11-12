import sys
import os
import uvicorn

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

if __name__ == "__main__":
    print("========================================================")
    print("   Starting Prilans - Student Freelancing Platform      ")
    print("   Serving on: http://localhost:8000                   ")
    print("   API Documentation: http://localhost:8000/docs        ")
    print("========================================================")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True, app_dir="backend")
