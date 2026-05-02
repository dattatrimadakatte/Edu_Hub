#!/usr/bin/env python3
"""
Complete Database Initialization Script for EduHub
This script ensures all tables are created and basic data is inserted
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database import SQLALCHEMY_DATABASE_URL, Base
import models
import utils
from datetime import datetime

def init_database():
    """Initialize the complete database with all tables and sample data"""
    print("🚀 Starting EduHub Database Initialization...")
    
    try:
        # Create engine and session
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        print("✅ Database connection established")
        
        # Create all tables
        print("📋 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully")
        
        # Verify tables exist
        table_names = [
            'users', 'courses', 'assignments', 'assignment_submissions',
            'enrollments', 'resources', 'forum_posts', 'forum_replies',
            'achievements', 'user_achievements', 'schedule_slots', 'progress'
        ]
        
        print("🔍 Verifying tables...")
        for table in table_names:
            try:
                result = db.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                print(f"  ✅ {table}: {count} records")
            except Exception as e:
                print(f"  ❌ {table}: Error - {e}")
        
        # Create admin user if not exists
        print("👤 Creating admin user...")
        admin_exists = db.query(models.User).filter(models.User.role == "admin").first()
        if not admin_exists:
            admin_user = models.User(
                name="Admin User",
                email="admin@eduhub.com",
                hashed_password=utils.hash_password("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            print("  ✅ Admin user created (admin@eduhub.com / admin123)")
        else:
            print("  ℹ️ Admin user already exists")
        
        # Create sample instructor
        print("👨‍🏫 Creating sample instructor...")
        instructor_exists = db.query(models.User).filter(models.User.email == "instructor@eduhub.com").first()
        if not instructor_exists:
            instructor_user = models.User(
                name="Dr. Sarah Johnson",
                email="instructor@eduhub.com",
                hashed_password=utils.hash_password("instructor123"),
                role="instructor",
                is_active=True
            )
            db.add(instructor_user)
            print("  ✅ Instructor created (instructor@eduhub.com / instructor123)")
        else:
            print("  ℹ️ Instructor already exists")
        
        # Create sample student
        print("👨‍🎓 Creating sample student...")
        student_exists = db.query(models.User).filter(models.User.email == "student@eduhub.com").first()
        if not student_exists:
            student_user = models.User(
                name="John Smith",
                email="student@eduhub.com",
                hashed_password=utils.hash_password("student123"),
                role="student",
                is_active=True
            )
            db.add(student_user)
            print("  ✅ Student created (student@eduhub.com / student123)")
        else:
            print("  ℹ️ Student already exists")
        
        db.commit()
        
        # Get instructor for courses
        instructor = db.query(models.User).filter(models.User.role == "instructor").first()
        
        if instructor:
            # Create sample courses
            print("📚 Creating sample courses...")
            courses_data = [
                {
                    "title": "React Fundamentals",
                    "description": "Learn the basics of React development including components, state, and props",
                    "category": "Web Development",
                    "instructor_id": instructor.id
                },
                {
                    "title": "Python for Data Science",
                    "description": "Master Python for data analysis and machine learning with pandas and numpy",
                    "category": "Data Science",
                    "instructor_id": instructor.id
                },
                {
                    "title": "JavaScript Advanced",
                    "description": "Deep dive into advanced JavaScript concepts and modern ES6+ features",
                    "category": "Web Development",
                    "instructor_id": instructor.id
                }
            ]
            
            for course_data in courses_data:
                existing = db.query(models.Course).filter(models.Course.title == course_data["title"]).first()
                if not existing:
                    course = models.Course(**course_data)
                    db.add(course)
                    print(f"  ✅ Course created: {course_data['title']}")
                else:
                    print(f"  ℹ️ Course already exists: {course_data['title']}")
        
        # Create sample achievements
        print("🏆 Creating achievements...")
        achievements_data = [
            {"name": "First Steps", "description": "Complete your first course", "icon": "🎯", "points": 10},
            {"name": "Knowledge Seeker", "description": "Complete 5 courses", "icon": "📚", "points": 50},
            {"name": "Study Streak", "description": "Study for 7 consecutive days", "icon": "🔥", "points": 25},
            {"name": "Master Learner", "description": "Complete 10 courses", "icon": "🏆", "points": 100},
            {"name": "Community Helper", "description": "Help 10 students in forum", "icon": "🤝", "points": 75},
            {"name": "Speed Learner", "description": "Complete a course in under 24 hours", "icon": "⚡", "points": 40}
        ]
        
        for ach_data in achievements_data:
            existing = db.query(models.Achievement).filter(models.Achievement.name == ach_data["name"]).first()
            if not existing:
                achievement = models.Achievement(**ach_data)
                db.add(achievement)
                print(f"  ✅ Achievement created: {ach_data['name']}")
            else:
                print(f"  ℹ️ Achievement already exists: {ach_data['name']}")
        
        # Create sample schedule
        print("📅 Creating schedule...")
        schedule_data = [
            {"day": "Monday", "time": "09:00 AM", "course": "Data Structures", "room": "Lab 2", "instructor": "Dr. Smith"},
            {"day": "Monday", "time": "11:30 AM", "course": "Python Basics", "room": "Room 302", "instructor": "Prof. Johnson"},
            {"day": "Tuesday", "time": "10:00 AM", "course": "Web Development", "room": "Online", "instructor": "Ms. Davis"},
            {"day": "Wednesday", "time": "10:00 AM", "course": "Algorithms", "room": "Hall A", "instructor": "Dr. Wilson"},
            {"day": "Thursday", "time": "02:00 PM", "course": "React Advanced", "room": "Room 101", "instructor": "Mr. Brown"},
            {"day": "Friday", "time": "09:00 AM", "course": "Database Design", "room": "Lab 1", "instructor": "Dr. Taylor"}
        ]
        
        for slot_data in schedule_data:
            existing = db.query(models.ScheduleSlot).filter(
                models.ScheduleSlot.day == slot_data["day"],
                models.ScheduleSlot.time == slot_data["time"],
                models.ScheduleSlot.course == slot_data["course"]
            ).first()
            if not existing:
                slot = models.ScheduleSlot(**slot_data)
                db.add(slot)
                print(f"  ✅ Schedule slot created: {slot_data['day']} {slot_data['time']} - {slot_data['course']}")
            else:
                print(f"  ℹ️ Schedule slot already exists: {slot_data['day']} {slot_data['time']} - {slot_data['course']}")
        
        # Create sample forum posts
        print("💬 Creating sample forum posts...")
        if instructor and student_user:
            forum_posts_data = [
                {
                    "title": "Welcome to EduHub Forum!",
                    "content": "This is a place where students and instructors can discuss course topics, ask questions, and share knowledge. Feel free to start a discussion!",
                    "author_id": instructor.id
                },
                {
                    "title": "Question about React Components",
                    "content": "I'm having trouble understanding how props work in React components. Can someone explain the difference between props and state?",
                    "author_id": student_user.id
                },
                {
                    "title": "Study Group for Data Science Course",
                    "content": "Anyone interested in forming a study group for the Python Data Science course? We could meet weekly to discuss assignments and concepts.",
                    "author_id": student_user.id
                }
            ]
            
            for post_data in forum_posts_data:
                existing = db.query(models.ForumPost).filter(models.ForumPost.title == post_data["title"]).first()
                if not existing:
                    post = models.ForumPost(**post_data)
                    db.add(post)
                    print(f"  ✅ Forum post created: {post_data['title']}")
                else:
                    print(f"  ℹ️ Forum post already exists: {post_data['title']}")
        
        db.commit()
        
        print("\n🎉 Database initialization completed successfully!")
        print("\n📋 Summary:")
        print("  - All tables created and verified")
        print("  - Admin user: admin@eduhub.com / admin123")
        print("  - Instructor: instructor@eduhub.com / instructor123")
        print("  - Student: student@eduhub.com / student123")
        print("  - Sample courses, achievements, schedule, and forum posts created")
        print("\n✅ Your EduHub database is ready to use!")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Database initialization failed: {str(e)}")
        import traceback
        print(f"Error details: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)