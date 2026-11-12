from fastapi import APIRouter, HTTPException, status, Depends
from app.database import get_db
from app.schemas import UserRegister, UserLogin, TokenResponse
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (user_data.email.lower(),))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        pwd_hash = hash_password(user_data.password)
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, country, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            user_data.name,
            user_data.email.lower(),
            pwd_hash,
            user_data.role,
            user_data.country or "United States",
            f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.name}"
        ))
        user_id = cursor.lastrowid
        
        if user_data.role == "student":
            cursor.execute("""
                INSERT INTO student_profiles (user_id, university, major, bio, hourly_rate, experience_level, availability_status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id,
                user_data.university or "University Student",
                user_data.major or "Computer Science",
                "Passionate student eager to work on real-world projects.",
                20.0,
                "Intermediate",
                "Available"
            ))
            
        cursor.execute("SELECT id, name, email, role, country, avatar_url FROM users WHERE id = ?", (user_id,))
        user = dict(cursor.fetchone())
        token = create_access_token({"user_id": user["id"], "role": user["role"]})
        return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (login_data.email.lower(),))
        user_row = cursor.fetchone()
        if not user_row or not verify_password(login_data.password, user_row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user = {
            "id": user_row["id"],
            "name": user_row["name"],
            "email": user_row["email"],
            "role": user_row["role"],
            "country": user_row["country"],
            "avatar_url": user_row["avatar_url"]
        }
        token = create_access_token({"user_id": user["id"], "role": user["role"]})
        return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        if current_user["role"] == "student":
            cursor.execute("SELECT * FROM student_profiles WHERE user_id = ?", (current_user["id"],))
            profile = cursor.fetchone()
            current_user["profile"] = dict(profile) if profile else {}
            
            cursor.execute("SELECT skill_name, proficiency FROM student_skills WHERE user_id = ?", (current_user["id"],))
            current_user["skills"] = [dict(r) for r in cursor.fetchall()]
        return current_user

