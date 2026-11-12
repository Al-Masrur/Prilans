import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import init_db
from app.seed_data import seed_database
from app.routers import auth, students, projects, applications, reviews, admin, recommendations

init_db()
seed_database()

app = FastAPI(
    title="Prilans API",
    description="Backend API for Prilans Student Freelancing Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(projects.router)
app.include_router(applications.router)
app.include_router(reviews.router)
app.include_router(admin.router)
app.include_router(recommendations.router)

# Mount frontend directory for SPA
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend")
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
