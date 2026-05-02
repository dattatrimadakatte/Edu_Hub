#!/usr/bin/env python3
"""
PostgreSQL Database Setup and Verification for EduHub
This script specifically handles PostgreSQL database setup
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

def check_postgresql_connection():
    """Check if PostgreSQL is accessible"""
    print("🔍 Checking PostgreSQL connection...")
    try:
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"  ✅ PostgreSQL connected: {version}")
            return True, engine
    except Exception as e:
        print(f"  ❌ PostgreSQL connection failed: {str(e)}")
        print(f"  💡 Make sure PostgreSQL is running and database 'eduhub_db' exists")
        print(f"  💡 Connection string: {SQLALCHEMY_DATABASE_URL}")
        return False, None

def setup_postgresql_database():
    """Setup PostgreSQL database with all tables and data"""
    print("🚀 Starting PostgreSQL EduHub Database Setup...")
    
    # Check connection first
    connected, engine = check_postgresql_connection()
    if not connected:
        return False
    
    try:
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Create all tables
        print("📋 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully")
        
        # Verify tables exist in PostgreSQL
        table_names = [
            'users', 'courses', 'assignments', 'assignment_submissions',
            'enrollments', 'resources', 'forum_posts', 'forum_replies',
            'achievements', 'user_achievements', 'schedule_slots', 'progress'
        ]
        
        print("🔍 Verifying PostgreSQL tables...")
        for table in table_names:
            try:
                result = db.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                print(f"  ✅ {table}: {count} records")
            except Exception as e:
                print(f"  ❌ {table}: Error - {e}")
        
        # Create users with proper PostgreSQL handling
        print("👤 Creating users...")
        
        # Admin user
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
        
        # Instructor user
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
        
        # Student user
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
        
        # Create achievements
        print("🏆 Creating achievements...")
        achievements_data = [
            {"name": "First Steps", "description": "Complete your first course", "icon": "🎯", "points": 10},
            {"name": "Knowledge Seeker", "description": "Complete 5 courses", "icon": "📚", "points": 50},
            {"name": "Study Streak", "description": "Study for 7 consecutive days", "icon": "🔥", "points": 25},
            {"name": "Master Learner", "description": "Complete 10 courses", "icon": "🏆", "points": 100}
        ]
        
        for ach_data in achievements_data:
            existing = db.query(models.Achievement).filter(models.Achievement.name == ach_data["name"]).first()
            if not existing:
                achievement = models.Achievement(**ach_data)
                db.add(achievement)
                print(f"  ✅ Achievement created: {ach_data['name']}")
            else:
                print(f"  ℹ️ Achievement already exists: {ach_data['name']}")
        
        # Create schedule
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
        
        db.commit()
        
        # Final verification
        print("\n🔍 Final PostgreSQL verification...")
        total_users = db.query(models.User).count()
        total_courses = db.query(models.Course).count()
        total_achievements = db.query(models.Achievement).count()
        total_schedule = db.query(models.ScheduleSlot).count()
        
        print(f"  📊 Users: {total_users}")
        print(f"  📊 Courses: {total_courses}")
        print(f"  📊 Achievements: {total_achievements}")
        print(f"  📊 Schedule slots: {total_schedule}")
        
        print("\n🎉 PostgreSQL EduHub database setup completed successfully!")
        print("\n📋 Summary:")
        print("  - PostgreSQL connection verified")
        print("  - All tables created and verified")
        print("  - Sample data inserted")
        print("  - Login credentials:")
        print("    • Admin: admin@eduhub.com / admin123")
        print("    • Instructor: instructor@eduhub.com / instructor123")
        print("    • Student: student@eduhub.com / student123")
        print("\n✅ Your PostgreSQL EduHub database is ready!")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ PostgreSQL setup failed: {str(e)}")
        import traceback
        print(f"Error details: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = setup_postgresql_database()
    input("\nPress Enter to exit...")
    sys.exit(0 if success else 1)