"""
Database initialization script for EduHub
Run this to ensure all tables are created properly
"""

from database import engine, get_db
import models
from sqlalchemy.orm import Session

def init_database():
    """Initialize database with all required tables"""
    try:
        print("Starting database initialization...")
        
        # Create all tables
        models.Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully")
        
        # Test database connection
        db = next(get_db())
        
        # Test basic operations
        try:
            result = db.execute("SELECT 1")
            print("✅ Database connection working")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
        
        # Check if tables exist and are accessible
        tables_to_check = [
            'users', 'courses', 'assignments', 'assignment_submissions',
            'enrollments', 'resources', 'forum_posts', 'forum_replies',
            'achievements', 'user_achievements', 'schedule_slots', 'progress'
        ]
        
        for table in tables_to_check:
            try:
                result = db.execute(f"SELECT COUNT(*) FROM {table}")
                count = result.scalar()
                print(f"✅ Table {table}: {count} records")
            except Exception as e:
                print(f"❌ Table {table} error: {e}")
        
        db.close()
        print("🎉 Database initialization completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

if __name__ == "__main__":
    init_database()