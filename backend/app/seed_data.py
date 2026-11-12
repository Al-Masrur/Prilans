from app.database import get_db, init_db
from app.auth import hash_password

def seed_database():
    init_db()
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if already seeded
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] > 0:
            print("Database already contains data. Skipping initial seeding.")
            return

        print("Seeding Prilans database with mockup and test data...")
        
        pwd = hash_password("password123")
        admin_pwd = hash_password("admin123")

        # 1. Users
        # Student matching the mockup avatar & name:
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, country, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            "Akramul Hossain Shiblu", 
            "akramulhossain@gmail.com", 
            pwd, 
            "student", 
            "Bangladesh", 
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
        ))
        shiblu_id = cursor.lastrowid
        
        # Other students
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, country, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ("Sarah Jenkins", "sarah.j@mit.edu", pwd, "student", "United States", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80"))
        sarah_id = cursor.lastrowid

        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, country, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ("Alexandre Moreau", "alex.m@sorbonne.fr", pwd, "student", "Germany", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80"))
        alex_id = cursor.lastrowid

        # Clients matching the mockup cards
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, country, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ("HAV Design Studio", "contact@havdesign.de", pwd, "client", "Germany", "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=250&q=80"))
        hav_client_id = cursor.lastrowid

        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, country, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ("EduCourse Global", "support@educourse.org", pwd, "client", "United States", "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80"))
        educourse_client_id = cursor.lastrowid

        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, country, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ("Bengal Digital Media", "hello@bengaldigital.com", pwd, "client", "Bangladesh", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80"))
        bengal_client_id = cursor.lastrowid

        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, country, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ("Maple Apex Solutions", "projects@mapleapex.ca", pwd, "client", "Canada", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80"))
        maple_client_id = cursor.lastrowid

        # Admin User
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, country, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ("Platform Administrator", "admin@prilans.com", admin_pwd, "admin", "United States", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80"))
        admin_id = cursor.lastrowid

        # 2. Student Profiles
        cursor.execute("""
            INSERT INTO student_profiles (user_id, university, major, bio, hourly_rate, experience_level, github_url, portfolio_url, availability_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            shiblu_id,
            "University of Engineering & Technology",
            "Computer Science & Engineering",
            "Frontend developer and creative UI/UX designer with 2+ years of hands-on experience in WordPress, Figma, and modern web applications.",
            25.0,
            "Intermediate",
            "https://github.com/shiblu",
            "https://shiblu.design",
            "Available"
        ))

        cursor.execute("""
            INSERT INTO student_profiles (user_id, university, major, bio, hourly_rate, experience_level, github_url, portfolio_url, availability_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sarah_id,
            "MIT",
            "Software Systems",
            "Full stack Python and React enthusiast. Built numerous academic and client projects.",
            35.0,
            "Expert",
            "https://github.com/sarahj",
            "https://sarahj.dev",
            "Available"
        ))

        cursor.execute("""
            INSERT INTO student_profiles (user_id, university, major, bio, hourly_rate, experience_level, github_url, portfolio_url, availability_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alex_id,
            "Technical University of Munich",
            "Informatics",
            "Junior web developer focusing on responsive landing pages and WordPress themes.",
            18.0,
            "Entry Level",
            "https://github.com/alexm",
            "https://alexm.io",
            "Available"
        ))

        # 3. Student Skills
        shiblu_skills = [
            ("UI Design", "Expert"),
            ("Web Design", "Expert"),
            ("Landing Page", "Expert"),
            ("Web Development", "Intermediate"),
            ("WordPress", "Intermediate"),
            ("Figma", "Expert"),
            ("Responsive Design", "Expert")
        ]
        for sk, lvl in shiblu_skills:
            cursor.execute("INSERT INTO student_skills (user_id, skill_name, proficiency) VALUES (?, ?, ?)", (shiblu_id, sk, lvl))

        sarah_skills = [
            ("Python", "Expert"),
            ("FastAPI", "Expert"),
            ("React", "Expert"),
            ("SQL", "Intermediate"),
            ("Docker", "Intermediate")
        ]
        for sk, lvl in sarah_skills:
            cursor.execute("INSERT INTO student_skills (user_id, skill_name, proficiency) VALUES (?, ?, ?)", (sarah_id, sk, lvl))

        # 4. Portfolios for Shiblu (Advanced Feature)
        cursor.execute("""
            INSERT INTO portfolios (user_id, title, description, project_url, image_url, tags)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            shiblu_id,
            "FinTech Mobile & Web Dashboard",
            "A modern banking dashboard with dark mode, transaction graphs, and multi-currency support designed in Figma.",
            "https://fintech-mockup.prilans.test",
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
            "Figma, UI/UX, Dashboard"
        ))

        cursor.execute("""
            INSERT INTO portfolios (user_id, title, description, project_url, image_url, tags)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            shiblu_id,
            "Clean Organic Brand E-Commerce Store",
            "High-converting Shopify/WordPress e-commerce storefront with customized responsive layout and speed optimization.",
            "https://organic-demo.prilans.test",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
            "WordPress, Responsive Design, E-Commerce"
        ))

        # 5. Mockup Projects (Matching the UI screenshot exactly!)
        
        # Project 1: Let's Collaborate on HAV's Website Redesign
        cursor.execute("""
            INSERT INTO projects (client_id, title, description, category, project_type, budget, experience_level, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            hav_client_id,
            "Let's Collaborate on HAV's Website Redesign",
            "We are looking for a creative person who can redesign & build beautiful landing pages in WordPress sites. Must be skilled in creating clean, fast-loading visual components.",
            "Web Design",
            "Hourly",
            15.0,
            "Entry Level",
            "Germany"
        ))
        p1_id = cursor.lastrowid
        for sk in ["UI Design", "Web Design", "Landing Page", "Web Development", "WordPress"]:
            cursor.execute("INSERT INTO project_skills (project_id, skill_name) VALUES (?, ?)", (p1_id, sk))

        # Project 2: Build/Edit Landing Page for Online Course
        cursor.execute("""
            INSERT INTO projects (client_id, title, description, category, project_type, budget, experience_level, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            educourse_client_id,
            "Build/Edit Landing Page for Online Course",
            "Have a current landing page for my website/course (about). Can either edit that one for my new course or make a new one. Looking for modern visual aesthetics and clear call-to-actions.",
            "Web Design",
            "Hourly",
            20.0,
            "Entry Level",
            "United States"
        ))
        p2_id = cursor.lastrowid
        for sk in ["Website Redesign", "Web Design", "Landing Page", "Graphic Design", "Logo Design", "UI/UX"]:
            cursor.execute("INSERT INTO project_skills (project_id, skill_name) VALUES (?, ?)", (p2_id, sk))

        # Project 3: Web Designer for E-Commerce Website
        cursor.execute("""
            INSERT INTO projects (client_id, title, description, category, project_type, budget, experience_level, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            bengal_client_id,
            "Web Designer for E-Commerce Website",
            "Install new e-commerce responsive WordPress theme. Redesign menu, layout and create pages and posts for a lifestyle and clothing brand.",
            "Web Development",
            "Hourly",
            25.0,
            "Intermediate",
            "Bangladesh"
        ))
        p3_id = cursor.lastrowid
        for sk in ["Web Design", "Responsive Design", "Web Development", "WordPress"]:
            cursor.execute("INSERT INTO project_skills (project_id, skill_name) VALUES (?, ?)", (p3_id, sk))

        # Project 4: Website Designer
        cursor.execute("""
            INSERT INTO projects (client_id, title, description, category, project_type, budget, experience_level, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            maple_client_id,
            "Website Designer",
            "We're looking for a website designer who can help us redesign our company website, we prefer based designs using Figma with comprehensive brand design systems.",
            "Web Design",
            "Hourly",
            50.0,
            "Expert",
            "Canada"
        ))
        p4_id = cursor.lastrowid
        for sk in ["Web Design", "Adobe Photoshop", "Figma", "Prototyping", "Logo Design"]:
            cursor.execute("INSERT INTO project_skills (project_id, skill_name) VALUES (?, ?)", (p4_id, sk))

        # Project 5: Fixed Price Full Stack Web App (Shows fixed price & content)
        cursor.execute("""
            INSERT INTO projects (client_id, title, description, category, project_type, budget, experience_level, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            educourse_client_id,
            "Build Student Assessment Portal with Python & React",
            "Looking for a motivated university student to develop an interactive quiz and assessment portal. Backend in Python/FastAPI, frontend in React.",
            "Programming",
            "Fixed Price",
            1200.0,
            "Intermediate",
            "United States"
        ))
        p5_id = cursor.lastrowid
        for sk in ["Python", "FastAPI", "React", "SQL"]:
            cursor.execute("INSERT INTO project_skills (project_id, skill_name) VALUES (?, ?)", (p5_id, sk))

        # Project 6: Content Writing & Technical Blog Posts
        cursor.execute("""
            INSERT INTO projects (client_id, title, description, category, project_type, budget, experience_level, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            maple_client_id,
            "Technical Blog Post Writer for Cloud Computing",
            "Need well-researched, engaging articles explaining cloud architecture and AI workflows to university beginners.",
            "Content Writing",
            "Fixed Price",
            250.0,
            "Entry Level",
            "Remote"
        ))
        p6_id = cursor.lastrowid
        for sk in ["Content Writing", "Technical Writing", "Cloud Computing"]:
            cursor.execute("INSERT INTO project_skills (project_id, skill_name) VALUES (?, ?)", (p6_id, sk))

        # 6. Applications (To populate proposal numbers and status tracking)
        # Create applications for Project 1
        cursor.execute("""
            INSERT INTO applications (project_id, student_id, bid_amount, cover_letter, estimated_days, status)
            VALUES (?, ?, ?, ?, ?, 'Submitted')
        """, (p1_id, shiblu_id, 15.0, "I have extensive experience redesigning WordPress landing pages with modern UI principles. Please check my portfolio!", 5))

        cursor.execute("""
            INSERT INTO applications (project_id, student_id, bid_amount, cover_letter, estimated_days, status)
            VALUES (?, ?, ?, ?, ?, 'Shortlisted')
        """, (p2_id, shiblu_id, 20.0, "I can build your course landing page to maximize student conversions.", 4))

        cursor.execute("""
            INSERT INTO applications (project_id, student_id, bid_amount, cover_letter, estimated_days, status)
            VALUES (?, ?, ?, ?, ?, 'Accepted')
        """, (p3_id, shiblu_id, 25.0, "E-commerce WordPress setups are my specialty. Ready to start immediately.", 7))

        # Add mock applications from other students to reach proposal counts
        for i in range(1, 14):
            cursor.execute("""
                INSERT OR IGNORE INTO applications (project_id, student_id, bid_amount, cover_letter, estimated_days, status)
                VALUES (?, ?, ?, ?, ?, 'Submitted')
            """, (p1_id, sarah_id if i % 2 == 0 else alex_id, 15.0 + i, f"Proposal from applicant #{i}", 5 + i))

        # 7. Reviews (Advanced Feature 5 marks)
        cursor.execute("""
            INSERT INTO reviews (project_id, reviewer_id, reviewee_id, rating, comment)
            VALUES (?, ?, ?, 5, 'Akramul did an outstanding job on our WordPress layout! Highly communicative and delivered ahead of schedule.')
        """, (p3_id, bengal_client_id, shiblu_id))

        cursor.execute("""
            INSERT INTO reviews (project_id, reviewer_id, reviewee_id, rating, comment)
            VALUES (?, ?, ?, 5, 'Great work ethic and creative eye. Will definitely hire again!')
        """, (p1_id, hav_client_id, shiblu_id))

        print("Database seeded successfully with all required, advanced, and bonus test scenarios!")

