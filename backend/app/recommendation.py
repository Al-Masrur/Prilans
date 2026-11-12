from app.database import get_db

def recommend_projects_for_student(student_id: int, limit: int = 10):
    """
    Ranks open projects for a student based on:
    1. Skill overlap (Jaccard similarity / recall of required project skills)
    2. Experience level match (Entry/Intermediate/Expert alignment)
    """
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Fetch student profile and skills
        cursor.execute("SELECT experience_level FROM student_profiles WHERE user_id = ?", (student_id,))
        student_prof = cursor.fetchone()
        student_exp = student_prof["experience_level"] if student_prof else "Intermediate"
        
        cursor.execute("SELECT LOWER(skill_name) as skill FROM student_skills WHERE user_id = ?", (student_id,))
        student_skills = {row["skill"] for row in cursor.fetchall()}
        
        # 2. Fetch all open projects with their required skills
        cursor.execute("""
            SELECT p.*, u.name as client_name, u.country as client_country,
                   (SELECT COUNT(*) FROM applications a WHERE a.project_id = p.id) as proposals_count
            FROM projects p
            JOIN users u ON p.client_id = u.id
            WHERE p.status = 'open'
            ORDER BY p.created_at DESC
        """)
        projects = [dict(row) for row in cursor.fetchall()]
        
        scored_projects = []
        for p in projects:
            cursor.execute("SELECT LOWER(skill_name) as skill FROM project_skills WHERE project_id = ?", (p["id"],))
            p_skills = {row["skill"] for row in cursor.fetchall()}
            p["skills"] = list(p_skills)
            
            # Compute skill match score
            if p_skills:
                matching_skills = student_skills.intersection(p_skills)
                skill_score = len(matching_skills) / len(p_skills)
            else:
                skill_score = 0.5  # Neutral if project lists no specific skills
            
            # Experience alignment penalty/bonus
            exp_order = {"Entry Level": 1, "Intermediate": 2, "Expert": 3}
            s_level = exp_order.get(student_exp, 2)
            p_level = exp_order.get(p["experience_level"], 2)
            exp_score = 1.0 - (abs(s_level - p_level) * 0.25)
            
            # Total composite score (70% skill overlap + 30% experience level match)
            total_score = round((skill_score * 0.7 + exp_score * 0.3) * 100, 1)
            p["match_score"] = total_score
            p["matching_skills"] = list(student_skills.intersection(p_skills)) if p_skills else []
            scored_projects.append(p)
            
        scored_projects.sort(key=lambda x: x["match_score"], reverse=True)
        return scored_projects[:limit]


def match_students_for_project(project_id: int, limit: int = 10):
    """
    BONUS CHALLENGE (5 Marks):
    Recommends students based on the skills required by a project.
    Ranks students based on:
    1. Skill overlap (intersection with required project skills)
    2. Proficiency level weights (Expert: 1.0, Intermediate: 0.75, Beginner: 0.5)
    3. Student average client review rating
    4. Availability status
    """
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Fetch project requirements
        cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        project = cursor.fetchone()
        if not project:
            return []
        
        cursor.execute("SELECT LOWER(skill_name) as skill FROM project_skills WHERE project_id = ?", (project_id,))
        req_skills = {row["skill"] for row in cursor.fetchall()}
        
        # 2. Fetch all student candidates
        cursor.execute("""
            SELECT u.id, u.name, u.email, u.country, u.avatar_url,
                   sp.university, sp.major, sp.bio, sp.hourly_rate, sp.experience_level, sp.availability_status
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            WHERE u.role = 'student'
        """)
        students = [dict(row) for row in cursor.fetchall()]
        
        proficiency_weights = {
            "Expert": 1.0,
            "Intermediate": 0.8,
            "Beginner": 0.5
        }
        
        matched_candidates = []
        for s in students:
            # Student skills
            cursor.execute("SELECT LOWER(skill_name) as skill, proficiency FROM student_skills WHERE user_id = ?", (s["id"],))
            s_skill_rows = cursor.fetchall()
            s_skill_dict = {row["skill"]: row["proficiency"] for row in s_skill_rows}
            s["skills"] = [dict(row) for row in s_skill_rows]
            
            # Calculate review score
            cursor.execute("SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE reviewee_id = ?", (s["id"],))
            review_stats = cursor.fetchone()
            avg_rating = round(review_stats["avg_rating"], 1) if review_stats and review_stats["avg_rating"] else 5.0
            review_count = review_stats["review_count"] if review_stats else 0
            s["avg_rating"] = avg_rating
            s["review_count"] = review_count
            
            # Compute skill score
            matched_skills = []
            weighted_skill_sum = 0.0
            for skill in req_skills:
                if skill in s_skill_dict:
                    matched_skills.append(skill)
                    prof = s_skill_dict[skill]
                    weighted_skill_sum += proficiency_weights.get(prof, 0.7)
            
            skill_coverage = (len(matched_skills) / len(req_skills)) if req_skills else 0.5
            skill_quality = (weighted_skill_sum / len(req_skills)) if req_skills else 0.5
            
            # Bonus for matching experience level
            exp_bonus = 0.15 if s["experience_level"] == project["experience_level"] else 0.05
            rating_factor = (avg_rating / 5.0) * 0.15
            availability_factor = 0.1 if s["availability_status"] == "Available" else 0.0
            
            final_match_pct = round((skill_quality * 0.6 + exp_bonus + rating_factor + availability_factor) * 100, 1)
            # Cap at 100%
            final_match_pct = min(100.0, final_match_pct)
            
            s["match_percentage"] = final_match_pct
            s["matched_skills"] = matched_skills
            s["missing_skills"] = list(req_skills - set(matched_skills))
            matched_candidates.append(s)
            
        matched_candidates.sort(key=lambda x: x["match_percentage"], reverse=True)
        return matched_candidates[:limit]
