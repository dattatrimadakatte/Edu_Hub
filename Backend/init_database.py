#!/usr/bin/env python3
"""
Database initialization script for EduHub
This script creates all necessary tables and ensures database connectivity
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database import SQLALCHEMY_DATABASE_URL, Base
import models
import utils

def init_database():
    """Initialize the database with all required tables"""
    try:
        print("🔄 Initializing EduHub Database...")
        
        # Create engine
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        
        # Test connection
        print("🔗 Testing database connection...")
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        
        # Create all tables
        print("📋 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")
        
        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            # Check if admin user exists, if not create one
            admin_user = db.query(models.User).filter(models.User.role == "admin").first()
            if not admin_user:
                print("👤 Creating default admin user...")
                hashed_pass = utils.hash_password("admin123")
                admin_user = models.User(
                    name="Admin User",
                    email="admin@eduhub.com",
                    hashed_password=hashed_pass,
                    role="admin",
                    is_active=True
                )
                db.add(admin_user)
                db.commit()
                print("✅ Admin user created!")
                print("   Email: admin@eduhub.com")
                print("   Password: admin123")
            else:
                print("ℹ️  Admin user already exists")
            
            # Create sample instructor if none exists
            instructor = db.query(models.User).filter(models.User.role == "instructor").first()
            if not instructor:
                print("👨‍🏫 Creating sample instructor...")
                hashed_pass = utils.hash_password("instructor123")
                instructor = models.User(
                    name="Dr. Sarah Johnson",
                    email="instructor@eduhub.com",
                    hashed_password=hashed_pass,
                    role="instructor",
                    is_active=True
                )
                db.add(instructor)
                db.commit()
                print("✅ Sample instructor created!")
                print("   Email: instructor@eduhub.com")
                print("   Password: instructor123")
            
            # Create sample student if none exists
            student = db.query(models.User).filter(models.User.role == "student").first()
            if not student:
                print("👨‍🎓 Creating sample student...")
                hashed_pass = utils.hash_password("student123")
                student = models.User(
                    name="John Student",
                    email="student@eduhub.com",
                    hashed_password=hashed_pass,
                    role="student",
                    is_active=True
                )
                db.add(student)
                db.commit()
                print("✅ Sample student created!")
                print("   Email: student@eduhub.com")
                print("   Password: student123")
            
            # Verify all tables exist
            print("🔍 Verifying table creation...")
            table_names = [
                'users', 'courses', 'assignments', 'assignment_submissions',
                'enrollments', 'resources', 'forum_posts', 'forum_replies',
                'achievements', 'user_achievements', 'schedule_slots', 'progress'
            ]
            
            existing_tables = []
            for table in table_names:
                try:
                    result = db.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.scalar()
                    existing_tables.append(f"{table} ({count} records)")
                except Exception as e:
                    print(f"❌ Table {table} check failed: {e}")
            
            print("✅ Database verification complete!")
            print(f"📊 Tables found: {len(existing_tables)}/{len(table_names)}")
            for table in existing_tables:
                print(f"   - {table}")
            
        finally:
            db.close()
        
        print("\n🎉 Database initialization completed successfully!")
        print("🚀 You can now start the FastAPI server with: python main.py")
        
        return True
        
    except Exception as e:
        print(f"❌ Database initialization failed: {str(e)}")
        print("💡 Please check your database connection settings in database.py")
        return False

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)