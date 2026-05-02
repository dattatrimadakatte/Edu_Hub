from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str # "student", "instructor", or "admin"

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class ResourceCreate(BaseModel):
    title: str
    url: str
    resource_type: str
    category: str
    is_public: bool = False
    owner_id: int

class ResourceOut(BaseModel):
    id: int
    title: str
    url: str
    resource_type: str
    category: str
    is_public: bool
    owner_id: int

    class Config:
        from_attributes = True

class CourseCreate(BaseModel):
    title: str
    description: str
    category: str
    instructor_id: int

class CourseOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    instructor_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AssignmentCreate(BaseModel):
    title: str
    description: str
    due_date: Optional[datetime] = None
    points: int = 100
    course_id: int
    teacher_id: int

class AssignmentOut(BaseModel):
    id: int
    title: str
    description: str
    due_date: Optional[datetime]
    points: int
    course_id: int
    teacher_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AssignmentSubmissionCreate(BaseModel):
    assignment_id: int
    student_id: int
    submission_text: str = ""
    file_path: str = ""

class AssignmentSubmissionOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    submission_text: str
    file_path: str
    submitted_at: datetime
    grade: Optional[int]
    feedback: Optional[str]
    graded_at: Optional[datetime]

    class Config:
        from_attributes = True