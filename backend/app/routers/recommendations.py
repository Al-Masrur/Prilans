from fastapi import APIRouter, Depends, HTTPException
from app.recommendation import recommend_projects_for_student, match_students_for_project
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations & Matching"])

@router.get("/projects")
def get_recommended_projects(current_user: dict = Depends(require_role("student"))):
    """
    Skill-based project recommendations (Advanced Feature - 5 Marks)
    Returns projects prioritized by skill similarity and experience fit.
    """
    return recommend_projects_for_student(current_user["id"], limit=20)

@router.get("/match-students/{project_id}")
def get_recommended_students(project_id: int, current_user: dict = Depends(get_current_user)):
    """
    BONUS CHALLENGE (5 Marks):
    Develop a matching mechanism that recommends students based on the skills required by a project.
    """
    matches = match_students_for_project(project_id, limit=15)
    return {
        "project_id": project_id,
        "total_matched": len(matches),
        "candidates": matches
    }
