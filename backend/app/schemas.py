from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# Auth Schemas
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(..., pattern="^(student|client|admin)$")
    country: Optional[str] = "United States"
    university: Optional[str] = None
    major: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# Student Profile & Skill Schemas
class SkillItem(BaseModel):
    skill_name: str
    proficiency: str = "Intermediate"

class StudentProfileUpdate(BaseModel):
    university: Optional[str] = None
    major: Optional[str] = None
    bio: Optional[str] = None
    hourly_rate: Optional[float] = None
    experience_level: Optional[str] = "Intermediate"
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    availability_status: Optional[str] = "Available"
    skills: Optional[List[SkillItem]] = None

# Portfolio Schemas
class PortfolioCreate(BaseModel):
    title: str
    description: str
    project_url: Optional[str] = ""
    image_url: Optional[str] = ""
    tags: Optional[str] = ""

class PortfolioUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project_url: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[str] = None

# Project Schemas
class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=5)
    description: str = Field(..., min_length=15)
    category: str
    project_type: str = Field(..., pattern="^(Hourly|Fixed Price)$")
    budget: float = Field(..., gt=0)
    experience_level: str = Field(..., pattern="^(Entry Level|Intermediate|Expert)$")
    location: Optional[str] = "Remote"
    skills: List[str] = []

class ProjectFilter(BaseModel):
    keyword: Optional[str] = None
    category: Optional[str] = None
    experience_level: Optional[str] = None
    project_type: Optional[str] = None
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    min_proposals: Optional[int] = None
    max_proposals: Optional[int] = None
    sort_by: Optional[str] = "newest"  # newest, budget_desc, budget_asc, proposals_asc

# Application Schemas
class ApplicationCreate(BaseModel):
    bid_amount: float = Field(..., gt=0)
    cover_letter: str = Field(..., min_length=10)
    estimated_days: Optional[int] = 7

class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(Submitted|Under Review|Shortlisted|Accepted|Rejected)$")

# Review Schemas
class ReviewCreate(BaseModel):
    project_id: int
    reviewee_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=5)

