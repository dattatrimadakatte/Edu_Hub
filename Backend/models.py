from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # "student", "instructor", or "admin"
    is_active = Column(Boolean, default=True)
    
    resources = relationship("Resource", back_populates="owner")
    courses = relationship("Course", back_populates="instructor")
    enrollments = relationship("Enrollment", back_populates="student")
    forum_posts = relationship("ForumPost", back_populates="author")
    achievements = relationship("UserAchievement", back_populates="user")

class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    url = Column(String)
    resource_type = Column(String) # YouTube, PDF, GitHub
    category = Column(String)
    is_public = Column(Boolean, default=False) # Shared by Instructor?
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="resources")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    category = Column(String)
    instructor_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    instructor = relationship("User", back_populates="courses")
    enrollments = relationship("Enrollment", back_populates="course")

class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    progress = Column(Integer, default=0)
    
    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

class ForumPost(Base):
    __tablename__ = "forum_posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    author = relationship("User", back_populates="forum_posts")
    replies = relationship("ForumReply", back_populates="post")

class ForumReply(Base):
    __tablename__ = "forum_replies"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    post_id = Column(Integer, ForeignKey("forum_posts.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    post = relationship("ForumPost", back_populates="replies")
    author = relationship("User")

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    icon = Column(String)
    points = Column(Integer)

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    earned_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")

class LearningProgress(Base):
    __tablename__ = "progress"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    resource_id = Column(Integer, ForeignKey("resources.id"))
    total_time_seconds = Column(Integer, default=0)
    last_position = Column(String) # e.g., "12:45" for video

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    due_date = Column(DateTime)
    points = Column(Integer, default=100)
    course_id = Column(Integer, ForeignKey("courses.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    teacher = relationship("User")
    course = relationship("Course")
    submissions = relationship("AssignmentSubmission", back_populates="assignment")

class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    submission_text = Column(Text)
    file_path = Column(String)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    grade = Column(Integer)
    feedback = Column(Text)
    graded_at = Column(DateTime)
    
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User")

class ScheduleSlot(Base):
    __tablename__ = "schedule_slots"
    id = Column(Integer, primary_key=True, index=True)
    day = Column(String)
    time = Column(String)
    course = Column(String)
    room = Column(String)
    instructor = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)