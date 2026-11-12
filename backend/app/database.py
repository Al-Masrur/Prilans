import sqlite3
import os
from contextlib import contextmanager

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prilans.db")

def get_connection():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Users Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('student', 'client', 'admin')),
            country TEXT DEFAULT 'United States',
            avatar_url TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. Student Profiles Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_profiles (
            user_id INTEGER PRIMARY KEY,
            university TEXT NOT NULL,
            major TEXT NOT NULL,
            bio TEXT DEFAULT '',
            hourly_rate REAL DEFAULT 20.0,
            experience_level TEXT DEFAULT 'Intermediate' CHECK(experience_level IN ('Entry Level', 'Intermediate', 'Expert')),
            github_url TEXT DEFAULT '',
            portfolio_url TEXT DEFAULT '',
            availability_status TEXT DEFAULT 'Available' CHECK(availability_status IN ('Available', 'Busy', 'Not Available')),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
        """)

        # 3. Student Skills Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            skill_name TEXT NOT NULL,
            proficiency TEXT DEFAULT 'Intermediate' CHECK(proficiency IN ('Beginner', 'Intermediate', 'Expert')),
            UNIQUE(user_id, skill_name),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
        """)

        # 4. Student Portfolios Table (Advanced Feature)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS portfolios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            project_url TEXT DEFAULT '',
            image_url TEXT DEFAULT '',
            tags TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
        """)

        # 5. Projects Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            project_type TEXT NOT NULL CHECK(project_type IN ('Hourly', 'Fixed Price')),
            budget REAL NOT NULL,
            experience_level TEXT NOT NULL CHECK(experience_level IN ('Entry Level', 'Intermediate', 'Expert')),
            location TEXT DEFAULT 'Remote',
            status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'completed', 'cancelled')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES users (id) ON DELETE CASCADE
        );
        """)

        # 6. Project Required Skills Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS project_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            skill_name TEXT NOT NULL,
            UNIQUE(project_id, skill_name),
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        );
        """)

        # 7. Project Applications / Proposals Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            bid_amount REAL NOT NULL,
            cover_letter TEXT NOT NULL,
            estimated_days INTEGER DEFAULT 7,
            status TEXT DEFAULT 'Submitted' CHECK(status IN ('Submitted', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(project_id, student_id),
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE
        );
        """)

        # 8. Ratings & Reviews Table (Advanced Feature)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            reviewer_id INTEGER NOT NULL,
            reviewee_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            comment TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
            FOREIGN KEY (reviewer_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (reviewee_id) REFERENCES users (id) ON DELETE CASCADE
        );
        """)
