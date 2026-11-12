from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from app.database import get_db
from app.schemas import ApplicationCreate, ApplicationStatusUpdate
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/applications", tags=["Applications"])

@router.post("/projects/{project_id}/apply", status_code=201)
def apply_for_project(project_id: int, application: ApplicationCreate, current_user: dict = Depends(require_role("student"))):
    """Apply for a project (Required Feature - 8 Marks)"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check project status
        cursor.execute("SELECT id, status FROM projects WHERE id = ?", (project_id,))
        project = cursor.fetchone()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        if project["status"] != "open":
            raise HTTPException(status_code=400, detail="This project is no longer accepting applications")
            
        # Check duplicate application
        cursor.execute("SELECT id FROM applications WHERE project_id = ? AND student_id = ?", (project_id, current_user["id"]))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="You have already submitted an application for this project")
            
        cursor.execute("""
            INSERT INTO applications (project_id, student_id, bid_amount, cover_letter, estimated_days, status)
            VALUES (?, ?, ?, ?, ?, 'Submitted')
        """, (project_id, current_user["id"], application.bid_amount, application.cover_letter, application.estimated_days))
        
        return {"id": cursor.lastrowid, "message": "Application submitted successfully", "status": "Submitted"}

@router.get("/my")
def get_my_applications(current_user: dict = Depends(require_role("student"))):
    """View application status (Required Feature - 7 Marks)"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.*, p.title as project_title, p.category, p.project_type, p.budget as project_budget,
                   u.name as client_name, u.country as client_country, u.avatar_url as client_avatar
            FROM applications a
            JOIN projects p ON a.project_id = p.id
            JOIN users u ON p.client_id = u.id
            WHERE a.student_id = ?
            ORDER BY a.created_at DESC
        """, (current_user["id"],))
        return [dict(r) for r in cursor.fetchall()]

@router.get("/projects/{project_id}")
def get_project_applications(project_id: int, current_user: dict = Depends(get_current_user)):
    """Client views all proposals submitted for their project"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT client_id FROM projects WHERE id = ?", (project_id,))
        project = cursor.fetchone()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        if project["client_id"] != current_user["id"] and current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to view these applications")
            
        cursor.execute("""
            SELECT a.*, u.name as student_name, u.email as student_email, u.country as student_country,
                   u.avatar_url as student_avatar,
                   sp.university, sp.major, sp.experience_level, sp.hourly_rate
            FROM applications a
            JOIN users u ON a.student_id = u.id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            WHERE a.project_id = ?
            ORDER BY a.created_at DESC
        """, (project_id,))
        apps = [dict(r) for r in cursor.fetchall()]
        
        # Attach student skills to each application
        for app in apps:
            cursor.execute("SELECT skill_name, proficiency FROM student_skills WHERE user_id = ?", (app["student_id"],))
            app["skills"] = [dict(sk) for sk in cursor.fetchall()]
            
        return apps

@router.put("/{application_id}/status")
def update_application_status(
    application_id: int, 
    update: ApplicationStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Project application status updates (Advanced Feature - 5 Marks)"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.*, p.client_id 
            FROM applications a
            JOIN projects p ON a.project_id = p.id
            WHERE a.id = ?
        """, (application_id,))
        app = cursor.fetchone()
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
            
        if app["client_id"] != current_user["id"] and current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Only project client can update application status")
            
        cursor.execute("""
            UPDATE applications 
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (update.status, application_id))
        
        return {"message": f"Application status updated to {update.status}", "status": update.status}

