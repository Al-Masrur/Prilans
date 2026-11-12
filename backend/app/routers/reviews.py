from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.schemas import ReviewCreate
from app.auth import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews & Ratings"])

@router.post("/", status_code=201)
def add_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    """Rating and review system (Advanced Feature - 5 Marks)"""
    if review.reviewee_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="You cannot review yourself")
        
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verify project exists
        cursor.execute("SELECT id FROM projects WHERE id = ?", (review.project_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Project not found")
            
        cursor.execute("""
            INSERT INTO reviews (project_id, reviewer_id, reviewee_id, rating, comment)
            VALUES (?, ?, ?, ?, ?)
        """, (review.project_id, current_user["id"], review.reviewee_id, review.rating, review.comment))
        
        return {"id": cursor.lastrowid, "message": "Review submitted successfully"}

@router.get("/user/{user_id}")
def get_user_reviews(user_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar, p.title as project_title
            FROM reviews r
            JOIN users u ON r.reviewer_id = u.id
            JOIN projects p ON r.project_id = p.id
            WHERE r.reviewee_id = ?
            ORDER BY r.created_at DESC
        """, (user_id,))
        reviews = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute("SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE reviewee_id = ?", (user_id,))
        stats = cursor.fetchone()
        
        return {
            "average_rating": round(stats["avg_rating"], 1) if stats and stats["avg_rating"] else 5.0,
            "total_reviews": stats["total_reviews"] if stats else 0,
            "reviews": reviews
        }

