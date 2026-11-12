from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.database import get_db
from app.schemas import ProjectCreate
from app.auth import get_current_user, require_role, get_current_user_optional

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.post("/", status_code=201)
def create_project(project: ProjectCreate, current_user: dict = Depends(require_role("client", "admin"))):
    """Publish a project / job request (Required Feature - 8 Marks)"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO projects (client_id, title, description, category, project_type, budget, experience_level, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            current_user["id"], project.title, project.description, project.category,
            project.project_type, project.budget, project.experience_level, project.location or "Remote"
        ))
        project_id = cursor.lastrowid
        
        # Insert skills
        for skill in project.skills:
            if skill.strip():
                cursor.execute("""
                    INSERT OR IGNORE INTO project_skills (project_id, skill_name)
                    VALUES (?, ?)
                """, (project_id, skill.strip()))
                
        return {"id": project_id, "message": "Project published successfully"}

@router.get("/")
def get_projects(
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    experience_level: Optional[str] = None,
    project_type: Optional[str] = None,
    budget_range: Optional[str] = None, # lt100, 100to500, 500to1k, 1kto5k, gt5k
    proposals_range: Optional[str] = None, # lt5, 5to10, 10to15, 15to20
    sort_by: Optional[str] = "newest",
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Browse available projects (7 marks) & Search/filter projects (7 marks)
    Strictly aligns with the filters from the UI mockup.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT p.*, 
                   u.name as client_name, 
                   u.country as client_country,
                   u.avatar_url as client_avatar,
                   (SELECT COUNT(*) FROM applications a WHERE a.project_id = p.id) as proposals_count
            FROM projects p
            JOIN users u ON p.client_id = u.id
            WHERE p.status = 'open'
        """
        params = []
        
        if category and category.lower() != "all" and category.lower() != "any":
            query += " AND LOWER(p.category) = LOWER(?)"
            params.append(category)
            
        if experience_level and experience_level.lower() != "any":
            query += " AND LOWER(p.experience_level) = LOWER(?)"
            params.append(experience_level)
            
        if project_type:
            query += " AND LOWER(p.project_type) = LOWER(?)"
            params.append(project_type)
            
        if budget_range:
            if budget_range == "lt100":
                query += " AND p.budget < 100"
            elif budget_range == "100to500":
                query += " AND p.budget >= 100 AND p.budget <= 500"
            elif budget_range == "500to1k":
                query += " AND p.budget >= 500 AND p.budget <= 1000"
            elif budget_range == "1kto5k":
                query += " AND p.budget >= 1000 AND p.budget <= 500"
            elif budget_range == "gt5k":
                query += " AND p.budget > 5000"

        # Sorting
        if sort_by == "highest_budget":
            query += " ORDER BY p.budget DESC"
        elif sort_by == "lowest_proposals":
            query += " ORDER BY proposals_count ASC"
        else:
            query += " ORDER BY p.created_at DESC"
            
        cursor.execute(query, params)
        raw_projects = [dict(r) for r in cursor.fetchall()]
        
        # Attach project skills & filter post-query for proposals & keywords
        filtered_projects = []
        for p in raw_projects:
            cursor.execute("SELECT skill_name FROM project_skills WHERE project_id = ?", (p["id"],))
            p["skills"] = [s["skill_name"] for s in cursor.fetchall()]
            
            # Keyword filter (title, description, category, skills)
            if keyword:
                kw = keyword.lower()
                text_to_search = f"{p['title']} {p['description']} {p['category']} {' '.join(p['skills'])}".lower()
                if kw not in text_to_search:
                    continue
                    
            # Proposals range filter
            p_count = p["proposals_count"]
            if proposals_range:
                if proposals_range == "lt5" and not (p_count < 5):
                    continue
                elif proposals_range == "5to10" and not (5 <= p_count <= 10):
                    continue
                elif proposals_range == "10to15" and not (10 <= p_count <= 15):
                    continue
                elif proposals_range == "15to20" and not (15 <= p_count <= 20):
                    continue
                elif proposals_range == "gt20" and not (p_count > 20):
                    continue
                    
            # Check if current student has applied
            p["has_applied"] = False
            if current_user and current_user["role"] == "student":
                cursor.execute("SELECT id FROM applications WHERE project_id = ? AND student_id = ?", (p["id"], current_user["id"]))
                if cursor.fetchone():
                    p["has_applied"] = True
                    
            filtered_projects.append(p)
            
        return {
            "total_count": len(filtered_projects),
            "projects": filtered_projects
        }

@router.get("/{project_id}")
def get_project_details(project_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.*, u.name as client_name, u.country as client_country, u.avatar_url as client_avatar,
                   (SELECT COUNT(*) FROM applications a WHERE a.project_id = p.id) as proposals_count
            FROM projects p
            JOIN users u ON p.client_id = u.id
            WHERE p.id = ?
        """, (project_id,))
        project = cursor.fetchone()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project_dict = dict(project)
        cursor.execute("SELECT skill_name FROM project_skills WHERE project_id = ?", (project_id,))
        project_dict["skills"] = [s["skill_name"] for s in cursor.fetchall()]
        return project_dict

@router.delete("/{project_id}")
def delete_project(project_id: int, current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT client_id FROM projects WHERE id = ?", (project_id,))
        project = cursor.fetchone()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        if project["client_id"] != current_user["id"] and current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to delete this project")
        cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        return {"message": "Project removed"}
