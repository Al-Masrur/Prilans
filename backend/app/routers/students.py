from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.database import get_db
from app.schemas import StudentProfileUpdate, SkillItem, PortfolioCreate, PortfolioUpdate
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/students", tags=["Students"])

@router.get("/")
def list_students(skill: Optional[str] = None, university: Optional[str] = None):
    """Browse freelance students for the 'Find Freelancers' view"""
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT u.id, u.name, u.email, u.country, u.avatar_url,
                   sp.university, sp.major, sp.bio, sp.hourly_rate, sp.experience_level, sp.availability_status,
                   (SELECT AVG(rating) FROM reviews WHERE reviewee_id = u.id) as avg_rating,
                   (SELECT COUNT(*) FROM reviews WHERE reviewee_id = u.id) as review_count
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            WHERE u.role = 'student'
        """
        cursor.execute(query)
        students = [dict(r) for r in cursor.fetchall()]
        
        for s in students:
            s["avg_rating"] = round(s["avg_rating"], 1) if s["avg_rating"] else 5.0
            cursor.execute("SELECT skill_name, proficiency FROM student_skills WHERE user_id = ?", (s["id"],))
            s["skills"] = [dict(sk) for sk in cursor.fetchall()]
            
            cursor.execute("SELECT id, title, project_url, image_url, tags FROM portfolios WHERE user_id = ?", (s["id"],))
            s["portfolios"] = [dict(p) for p in cursor.fetchall()]
            
        if skill:
            skill_lower = skill.lower()
            students = [s for s in students if any(skill_lower in sk["skill_name"].lower() for sk in s["skills"])]
        if university:
            students = [s for s in students if university.lower() in s["university"].lower()]
            
        return students

@router.get("/profile")
def get_my_profile(current_user: dict = Depends(require_role("student"))):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM student_profiles WHERE user_id = ?", (current_user["id"],))
        profile = cursor.fetchone()
        cursor.execute("SELECT skill_name, proficiency FROM student_skills WHERE user_id = ?", (current_user["id"],))
        skills = [dict(r) for r in cursor.fetchall()]
        cursor.execute("SELECT * FROM portfolios WHERE user_id = ? ORDER BY created_at DESC", (current_user["id"],))
        portfolios = [dict(r) for r in cursor.fetchall()]
        
        return {
            "user": current_user,
            "profile": dict(profile) if profile else {},
            "skills": skills,
            "portfolios": portfolios
        }

@router.put("/profile")
def update_profile(data: StudentProfileUpdate, current_user: dict = Depends(require_role("student"))):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE student_profiles
            SET university = COALESCE(?, university),
                major = COALESCE(?, major),
                bio = COALESCE(?, bio),
                hourly_rate = COALESCE(?, hourly_rate),
                experience_level = COALESCE(?, experience_level),
                github_url = COALESCE(?, github_url),
                portfolio_url = COALESCE(?, portfolio_url),
                availability_status = COALESCE(?, availability_status)
            WHERE user_id = ?
        """, (
            data.university, data.major, data.bio, data.hourly_rate,
            data.experience_level, data.github_url, data.portfolio_url,
            data.availability_status, current_user["id"]
        ))
        
        # Update skills if provided
        if data.skills is not None:
            cursor.execute("DELETE FROM student_skills WHERE user_id = ?", (current_user["id"],))
            for item in data.skills:
                cursor.execute("""
                    INSERT INTO student_skills (user_id, skill_name, proficiency)
                    VALUES (?, ?, ?)
                """, (current_user["id"], item.skill_name.strip(), item.proficiency))
                
        return {"message": "Profile updated successfully"}

@router.post("/skills")
def add_or_update_skill(skill: SkillItem, current_user: dict = Depends(require_role("student"))):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO student_skills (user_id, skill_name, proficiency)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, skill_name) DO UPDATE SET proficiency = excluded.proficiency
        """, (current_user["id"], skill.skill_name.strip(), skill.proficiency))
        return {"message": f"Skill {skill.skill_name} saved"}

@router.delete("/skills/{skill_name}")
def delete_skill(skill_name: str, current_user: dict = Depends(require_role("student"))):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM student_skills WHERE user_id = ? AND LOWER(skill_name) = LOWER(?)", 
                       (current_user["id"], skill_name))
        return {"message": "Skill removed"}

# --- Student Portfolio Management (Advanced Feature - 5 Marks) ---

@router.post("/portfolio")
def create_portfolio(item: PortfolioCreate, current_user: dict = Depends(require_role("student"))):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO portfolios (user_id, title, description, project_url, image_url, tags)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (current_user["id"], item.title, item.description, item.project_url, item.image_url, item.tags))
        return {"message": "Portfolio item added", "id": cursor.lastrowid}

@router.get("/portfolio/{student_id}")
def get_student_portfolios(student_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM portfolios WHERE user_id = ? ORDER BY created_at DESC", (student_id,))
        return [dict(r) for r in cursor.fetchall()]

@router.delete("/portfolio/{portfolio_id}")
def delete_portfolio(portfolio_id: int, current_user: dict = Depends(require_role("student"))):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM portfolios WHERE id = ? AND user_id = ?", (portfolio_id, current_user["id"]))
        return {"message": "Portfolio item deleted"}

