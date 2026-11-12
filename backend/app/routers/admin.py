from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth import require_role

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])

@router.get("/stats")
def get_admin_stats(current_user: dict = Depends(require_role("admin"))):
    """Platform Analytics & Metrics (Admin Dashboard - 10 Marks)"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'student'")
        total_students = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'client'")
        total_clients = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM projects")
        total_projects = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM applications")
        total_applications = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM reviews")
        total_reviews = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(budget) FROM projects")
        total_volume = cursor.fetchone()[0] or 0.0
        
        # Recent activities
        cursor.execute("""
            SELECT 'application' as type, a.created_at, u.name as actor, p.title as context
            FROM applications a
            JOIN users u ON a.student_id = u.id
            JOIN projects p ON a.project_id = p.id
            ORDER BY a.created_at DESC LIMIT 5
        """)
        recent_apps = [dict(r) for r in cursor.fetchall()]
        
        return {
            "total_users": total_users,
            "total_students": total_students,
            "total_clients": total_clients,
            "total_projects": total_projects,
            "total_applications": total_applications,
            "total_reviews": total_reviews,
            "total_budget_volume": round(total_volume, 2),
            "recent_activity": recent_apps
        }

@router.get("/users")
def get_all_users(current_user: dict = Depends(require_role("admin"))):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.id, u.name, u.email, u.role, u.country, u.created_at,
                   (SELECT COUNT(*) FROM projects WHERE client_id = u.id) as projects_posted,
                   (SELECT COUNT(*) FROM applications WHERE student_id = u.id) as applications_made
            FROM users u
            ORDER BY u.created_at DESC
        """)
        return [dict(r) for r in cursor.fetchall()]

@router.delete("/users/{user_id}")
def delete_user(user_id: int, current_user: dict = Depends(require_role("admin"))):
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        return {"message": "User deleted successfully"}

@router.get("/projects")
def get_all_admin_projects(current_user: dict = Depends(require_role("admin"))):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.*, u.name as client_name, u.email as client_email,
                   (SELECT COUNT(*) FROM applications WHERE project_id = p.id) as applications_count
            FROM projects p
            JOIN users u ON p.client_id = u.id
            ORDER BY p.created_at DESC
        """)
        return [dict(r) for r in cursor.fetchall()]
