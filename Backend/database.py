from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


SQLALCHEMY_DATABASE_URL = "postgresql://postgres:1234@localhost:5432/eduhub_db"

# The engine is the starting point for any SQLAlchemy application
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Each instance of the SessionLocal class will be a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# We will inherit from this class to create each of the database models
Base = declarative_base()

# Dependency to get the DB session in our API routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()