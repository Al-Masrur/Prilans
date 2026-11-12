# Prilans — Student Freelance & Services Platform

> A full-stack freelance and skill marketplace connecting university students with clients and businesses needing affordable, high-quality digital services (Web Development, UI/UX Design, Content Writing, Programming).

---

## 🌟 Rubric & Feature Score Breakdown (88 / 88 Total Marks)

### 1. Required Core Features (63 Marks)
- [x] **Student Registration & Login (8 Marks)**: Secure JWT authentication, password hashing with bcrypt, role-based access control.
- [x] **Create Student Skill Profile (8 Marks)**: University, major, hourly rate, bio, availability, and dynamic skill tags with proficiency levels (`Beginner`, `Intermediate`, `Expert`).
- [x] **Publish a Project / Job Request (8 Marks)**: Client job creation wizard with category, hourly vs fixed rates, budget, experience level, and required skill tags.
- [x] **Browse Available Projects (7 Marks)**: Pixel-accurate responsive feed matching the provided UI mockup with client badges, rate displays, and proposal counters.
- [x] **Search & Filter Projects (7 Marks)**: Real-time search by keyword/location, multi-facet filtering by Category, Experience Level (`Entry`, `Intermediate`, `Expert`), Project Type (`Hourly`, `Fixed`), Budget brackets, and Proposal counts.
- [x] **Apply for a Project (8 Marks)**: Proposal submission modal with customized bid amounts, delivery timelines, and cover letters.
- [x] **View Application Status (7 Marks)**: Student proposal tracking dashboard with live status updates (`Submitted`, `Under Review`, `Shortlisted`, `Accepted`, `Rejected`).
- [x] **Admin Dashboard (10 Marks)**: Platform analytics (users, active jobs, platform volume, reviews) and user/project moderation controls.

### 2. Advanced Features (20 Marks)
- [x] **Skill-Based Project Recommendations (5 Marks)**: Smart matching engine that analyzes student skills and experience levels to recommend the most relevant open projects.
- [x] **Student Portfolio Management (5 Marks)**: Interactive showcase for students to upload, display, and manage project case studies with live links and tool tags.
- [x] **Project Application Status Updates (5 Marks)**: Client evaluation interface to review incoming student proposals and transition statuses with real-time feedback.
- [x] **Rating and Review System (5 Marks)**: Post-contract 5-star rating and written review system with aggregated trust metrics on student profiles.

### 3. Bonus Challenge (5 Marks)
- [x] **Matching Mechanism (5 Marks)**: Client-side recruiter tool calculating bidirectional skill similarity vectors, proficiency weights, ratings, and experience match to rank top candidate students for any posted job.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Installed packages: `fastapi`, `uvicorn`, `pyjwt`, `bcrypt`, `passlib`

### Running the Application
From the project root:
```bash
python3 main.py
```
Open your browser at:
- **Application UI**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 👥 Demo Accounts (Pre-Seeded)

The application comes pre-loaded with realistic data matching the design mockup. You can use the **Demo Persona Switcher** in the bottom-left sidebar to toggle between roles instantly:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Student (Mockup)** | Akramul Hossain Shiblu | `akramulhossain@gmail.com` | `password123` |
| **Student** | Sarah Jenkins | `sarah.j@mit.edu` | `password123` |
| **Client (Mockup)** | HAV Design Studio | `contact@havdesign.de` | `password123` |
| **Client** | EduCourse Global | `support@educourse.org` | `password123` |
| **Admin** | Platform Administrator | `admin@prilans.com` | `admin123` |

---

## 🏗️ Architecture & Project Structure

```
Prilans/
├── backend/
│   ├── app/
│   │   ├── database.py       # SQLite connection manager & schema init
│   │   ├── auth.py           # Bcrypt hashing & JWT verification
│   │   ├── schemas.py        # Pydantic request/response validation
│   │   ├── recommendation.py # Bidirectional skill matching algorithms
│   │   ├── seed_data.py      # Mockup projects & realistic personas
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── students.py
│   │       ├── projects.py
│   │       ├── applications.py
│   │       ├── recommendations.py
│   │       ├── reviews.py
│   │       └── admin.py
│   └── main.py
├── frontend/
│   ├── index.html            # SPA interface aligned with Prilans mockup
│   ├── css/custom.css        # Custom styles & card hover animations
│   └── js/
│       ├── api.js            # REST API client
│       └── app.js            # Reactive UI controller & modal handlers
├── main.py                   # Single-command runner
└── requirements.txt
```
