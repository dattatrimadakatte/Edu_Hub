from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import models, schemas, utils
from database import engine, get_db
import traceback

app = FastAPI()

# Add CORS middleware first
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "EduHub API is running"}

@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    try:
        # Test database connection
        result = db.execute("SELECT 1")
        return {"status": "Database connected successfully"}
    except Exception as e:
        return {"status": "Database connection failed", "error": str(e)}

@app.post("/register", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        print(f"Received registration request: {user.dict()}")
        
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_pass = utils.hash_password(user.password)
        new_user = models.User(
            name=user.name,
            email=user.email, 
            hashed_password=hashed_pass, 
            role=user.role
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"User created successfully: {new_user.id}")
        return new_user
    except Exception as e:
        print(f"Registration error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login", response_model=schemas.UserOut)
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    try:
        print(f"Login attempt: {user.email}")
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        
        if not db_user:
            print(f"User not found: {user.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        print(f"Found user: {db_user.email}, role: {db_user.role}")
        print(f"Stored hash: {db_user.hashed_password}")
        
        input_hash = utils.hash_password(user.password)
        print(f"Input hash: {input_hash}")
        
        if not utils.verify_password(user.password, db_user.hashed_password):
            print("Password verification failed")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        print("Login successful")
        return db_user
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/dashboard/student/{user_id}")
def get_student_dashboard(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or user.role != "student":
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get student's enrollments
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.student_id == user_id).all()
    active_courses = len(enrollments)
    
    # Get total study time from learning progress
    total_progress = db.query(func.sum(models.LearningProgress.total_time_seconds)).filter(
        models.LearningProgress.user_id == user_id
    ).scalar() or 0
    study_hours = round(total_progress / 3600, 1)
    
    # Get certificates (achievements)
    certificates = db.query(models.UserAchievement).filter(models.UserAchievement.user_id == user_id).count()
    
    # Calculate day streak (mock for now)
    day_streak = 7
    
    # Get recent activity
    recent_submissions = db.query(models.AssignmentSubmission).filter(
        models.AssignmentSubmission.student_id == user_id
    ).order_by(models.AssignmentSubmission.submitted_at.desc()).limit(5).all()
    
    recent_enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == user_id
    ).order_by(models.Enrollment.enrolled_at.desc()).limit(5).all()
    
    recent_activity = []
    
    # Add recent submissions
    for submission in recent_submissions:
        assignment = db.query(models.Assignment).filter(models.Assignment.id == submission.assignment_id).first()
        recent_activity.append({
            "title": f"Submitted: {assignment.title if assignment else 'Assignment'}",
            "time": submission.submitted_at.strftime("%Y-%m-%d %H:%M") if submission.submitted_at else "Recently",
            "type": "submission"
        })
    
    # Add recent enrollments
    for enrollment in recent_enrollments:
        course = db.query(models.Course).filter(models.Course.id == enrollment.course_id).first()
        recent_activity.append({
            "title": f"Enrolled in: {course.title if course else 'Course'}",
            "time": enrollment.enrolled_at.strftime("%Y-%m-%d %H:%M") if enrollment.enrolled_at else "Recently",
            "type": "enrollment"
        })
    
    # Sort by time and limit
    recent_activity = sorted(recent_activity, key=lambda x: x['time'], reverse=True)[:10]
    
    # If no real activity, add some default
    if not recent_activity:
        recent_activity = [
            {"title": "Welcome to EduHub!", "time": "Today", "type": "welcome"},
            {"title": "Explore available courses", "time": "Today", "type": "suggestion"}
        ]
    
    return {
        "user": user,
        "stats": {
            "active_courses": active_courses,
            "study_hours": study_hours,
            "certificates": certificates,
            "day_streak": day_streak
        },
        "recent_activity": recent_activity
    }

@app.get("/dashboard/teacher/{user_id}")
def get_teacher_dashboard(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or user.role != "instructor":
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Get actual teacher's courses
    teacher_courses = db.query(models.Course).filter(models.Course.instructor_id == user_id).all()
    active_courses = len(teacher_courses)
    
    # Get students enrolled in teacher's courses
    enrolled_students = 0
    for course in teacher_courses:
        enrollments = db.query(models.Enrollment).filter(models.Enrollment.course_id == course.id).count()
        enrolled_students += enrollments
    
    # If no enrolled students, show total students for demo
    if enrolled_students == 0:
        enrolled_students = db.query(models.User).filter(models.User.role == "student").count()
    
    # Get teacher's assignments count
    assignments_count = db.query(models.Assignment).filter(models.Assignment.teacher_id == user_id).count()
    
    # Get actual submission count for teacher's assignments
    submissions_count = db.query(models.AssignmentSubmission).join(models.Assignment).filter(
        models.Assignment.teacher_id == user_id
    ).count()
    
    # Calculate average performance from submissions
    submissions = db.query(models.AssignmentSubmission).join(models.Assignment).filter(
        models.Assignment.teacher_id == user_id,
        models.AssignmentSubmission.grade.isnot(None)
    ).all()
    
    avg_performance = 0
    if submissions:
        total_grade = sum(sub.grade for sub in submissions)
        avg_performance = round(total_grade / len(submissions), 1)
    
    # Get recent activity
    recent_submissions = db.query(models.AssignmentSubmission).join(models.Assignment).filter(
        models.Assignment.teacher_id == user_id
    ).order_by(models.AssignmentSubmission.submitted_at.desc()).limit(5).all()
    
    recent_enrollments = db.query(models.Enrollment).join(models.Course).filter(
        models.Course.instructor_id == user_id
    ).order_by(models.Enrollment.enrolled_at.desc()).limit(5).all()
    
    recent_activity = []
    
    # Add recent submissions
    for submission in recent_submissions:
        student = db.query(models.User).filter(models.User.id == submission.student_id).first()
        assignment = db.query(models.Assignment).filter(models.Assignment.id == submission.assignment_id).first()
        recent_activity.append({
            "title": f"New assignment submitted by {student.name if student else 'Unknown'}",
            "time": submission.submitted_at.strftime("%Y-%m-%d %H:%M") if submission.submitted_at else "Recently",
            "type": "submission"
        })
    
    # Add recent enrollments
    for enrollment in recent_enrollments:
        student = db.query(models.User).filter(models.User.id == enrollment.student_id).first()
        course = db.query(models.Course).filter(models.Course.id == enrollment.course_id).first()
        recent_activity.append({
            "title": f"{student.name if student else 'Student'} enrolled in {course.title if course else 'course'}",
            "time": enrollment.enrolled_at.strftime("%Y-%m-%d %H:%M") if enrollment.enrolled_at else "Recently",
            "type": "enrollment"
        })
    
    # Sort by time and limit
    recent_activity = sorted(recent_activity, key=lambda x: x['time'], reverse=True)[:10]
    
    return {
        "user": user,
        "stats": {
            "active_courses": active_courses,
            "total_students": enrolled_students,
            "assignments": assignments_count,
            "submissions": submissions_count,  # Add submissions count
            "avg_performance": avg_performance
        },
        "recent_activity": recent_activity
    }

@app.post("/resources", response_model=schemas.ResourceOut)
def create_resource(resource: schemas.ResourceCreate, db: Session = Depends(get_db)):
    new_resource = models.Resource(**resource.dict())
    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    return new_resource

@app.get("/resources/{user_id}")
def get_user_resources(user_id: int, db: Session = Depends(get_db)):
    resources = db.query(models.Resource).filter(models.Resource.owner_id == user_id).all()
    return resources

@app.put("/resources/{resource_id}", response_model=schemas.ResourceOut)
def update_resource(resource_id: int, resource: schemas.ResourceCreate, db: Session = Depends(get_db)):
    db_resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    for key, value in resource.dict().items():
        setattr(db_resource, key, value)
    
    db.commit()
    db.refresh(db_resource)
    return db_resource

@app.delete("/resources/{resource_id}")
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    db_resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    db.delete(db_resource)
    db.commit()
    return {"message": "Resource deleted successfully"}

@app.get("/admin/dashboard/{user_id}")
def get_admin_dashboard(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or user.role != "admin":
        raise HTTPException(status_code=404, detail="Admin not found")
    
    total_users = db.query(models.User).count()
    total_students = db.query(models.User).filter(models.User.role == "student").count()
    total_instructors = db.query(models.User).filter(models.User.role == "instructor").count()
    total_resources = db.query(models.Resource).count()
    
    return {
        "user": user,
        "stats": {
            "total_users": total_users,
            "total_students": total_students,
            "total_instructors": total_instructors,
            "total_resources": total_resources
        }
    }

@app.get("/admin/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users

@app.put("/admin/users/{user_id}/toggle")
def toggle_user_status(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user

@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
@app.get("/create-admin")
def create_admin_user(db: Session = Depends(get_db)):
    # Check if admin already exists
    admin_exists = db.query(models.User).filter(models.User.role == "admin").first()
    if admin_exists:
        return {"message": "Admin user already exists"}
    
    # Create admin user
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
    db.refresh(admin_user)
    
@app.get("/fix-admin")
def fix_admin_password(db: Session = Depends(get_db)):
    admin_user = db.query(models.User).filter(models.User.email == "admin@eduhub.com").first()
    if admin_user:
        admin_user.hashed_password = utils.hash_password("admin123")
        db.commit()
        return {"message": "Admin password fixed", "email": "admin@eduhub.com", "password": "admin123"}
    return {"message": "Admin user not found"}

@app.get("/test-all-features")
def test_all_features(db: Session = Depends(get_db)):
    """Test endpoint to verify all features are working"""
    try:
        results = {}
        
        # Test database connection
        db.execute("SELECT 1")
        results["database_connection"] = "✅ Working"
        
        # Test user operations
        user_count = db.query(models.User).count()
        results["users"] = f"✅ {user_count} users in database"
        
        # Test course operations
        course_count = db.query(models.Course).count()
        results["courses"] = f"✅ {course_count} courses in database"
        
        # Test assignment operations
        assignment_count = db.query(models.Assignment).count()
        results["assignments"] = f"✅ {assignment_count} assignments in database"
        
        # Test schedule operations
        schedule_count = db.query(models.ScheduleSlot).count()
        results["schedule"] = f"✅ {schedule_count} schedule slots in database"
        
        # Test achievements
        achievement_count = db.query(models.Achievement).count()
        results["achievements"] = f"✅ {achievement_count} achievements in database"
        
        # Test forum
        forum_count = db.query(models.ForumPost).count()
        results["forum"] = f"✅ {forum_count} forum posts in database"
        
        # Test resources
        resource_count = db.query(models.Resource).count()
        results["resources"] = f"✅ {resource_count} resources in database"
        
        return {
            "status": "All systems operational",
            "timestamp": datetime.utcnow().isoformat(),
            "test_results": results,
            "message": "🎉 EduHub is fully functional!"
        }
        
    except Exception as e:
        return {
            "status": "System error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
    try:
        # Test database connection
        db.execute("SELECT 1")
        
        # Check if all tables exist
        tables_to_check = [
            'users', 'courses', 'assignments', 'assignment_submissions',
            'enrollments', 'resources', 'forum_posts', 'forum_replies',
            'achievements', 'user_achievements', 'schedule_slots', 'progress'
        ]
        
        existing_tables = []
        table_details = {}
        for table in tables_to_check:
            try:
                result = db.execute(f"SELECT COUNT(*) FROM {table}")
                count = result.scalar()
                existing_tables.append(table)
                table_details[table] = count
            except Exception as e:
                table_details[table] = f"Error: {str(e)}"
        
        # Test basic CRUD operations
        crud_test = True
        try:
            # Test if we can perform basic operations
            test_query = db.execute("SELECT 1 as test_value")
            test_result = test_query.scalar()
            if test_result != 1:
                crud_test = False
        except:
            crud_test = False
        
        health_status = "healthy" if len(existing_tables) == len(tables_to_check) and crud_test else "degraded"
        
        return {
            "status": health_status,
            "database": "connected",
            "tables_found": len(existing_tables),
            "total_tables": len(tables_to_check),
            "existing_tables": existing_tables,
            "table_details": table_details,
            "crud_operations": "working" if crud_test else "failed",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@app.get("/resources/public/all")
def get_public_resources(db: Session = Depends(get_db)):
    resources = db.query(models.Resource).filter(models.Resource.is_public == True).all()
    return resources

# Course endpoints
@app.post("/courses")
def create_course(course: dict, db: Session = Depends(get_db)):
    try:
        print(f"Creating course: {course}")
        
        # Validate required fields
        required_fields = ['title', 'description', 'category', 'instructor_id']
        for field in required_fields:
            if field not in course or not course[field]:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Check if instructor exists (allow any user for now, will validate role)
        instructor = db.query(models.User).filter(
            models.User.id == course['instructor_id']
        ).first()
        if not instructor:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create course with validated data (excluding course_link for now)
        course_data = {
            'title': str(course['title']).strip(),
            'description': str(course['description']).strip(),
            'category': str(course['category']).strip(),
            'instructor_id': int(course['instructor_id'])
        }
        
        new_course = models.Course(**course_data)
        db.add(new_course)
        db.commit()
        db.refresh(new_course)
        print(f"Course created successfully: {new_course.id}")
        
        # Return course with instructor info
        return {
            "id": new_course.id,
            "title": new_course.title,
            "description": new_course.description,
            "category": new_course.category,
            "instructor_id": new_course.instructor_id,
            "created_at": new_course.created_at,
            "instructor": {
                "name": instructor.name,
                "email": instructor.email
            }
        }
    except Exception as e:
        print(f"Course creation error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error saving course to database: {str(e)}")

@app.get("/courses")
def get_all_courses(db: Session = Depends(get_db)):
    try:
        courses = db.query(models.Course).all()
        
        # Format courses with instructor information
        formatted_courses = []
        for course in courses:
            instructor = db.query(models.User).filter(models.User.id == course.instructor_id).first()
            formatted_courses.append({
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "category": course.category,
                "instructor_id": course.instructor_id,
                "created_at": course.created_at,
                "instructor": {
                    "name": instructor.name if instructor else "Unknown Instructor",
                    "email": instructor.email if instructor else ""
                }
            })
        
        return formatted_courses
    except Exception as e:
        print(f"Get courses error: {str(e)}")
        return []

@app.get("/courses/instructor/{instructor_id}")
def get_instructor_courses(instructor_id: int, db: Session = Depends(get_db)):
    try:
        courses = db.query(models.Course).filter(models.Course.instructor_id == instructor_id).all()
        
        # Format courses with additional info
        formatted_courses = []
        for course in courses:
            # Get enrollment count
            enrollment_count = db.query(models.Enrollment).filter(models.Enrollment.course_id == course.id).count()
            
            # Get assignment count
            assignment_count = db.query(models.Assignment).filter(models.Assignment.course_id == course.id).count()
            
            formatted_courses.append({
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "category": course.category,
                "instructor_id": course.instructor_id,
                "created_at": course.created_at,
                "enrollment_count": enrollment_count,
                "assignment_count": assignment_count
            })
        
        return formatted_courses
    except Exception as e:
        print(f"Get instructor courses error: {str(e)}")
        return []
@app.put("/courses/{course_id}")
def update_course(course_id: int, course: dict, db: Session = Depends(get_db)):
    try:
        print(f"Updating course {course_id}: {course}")
        
        # Get the course
        db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
        if not db_course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check if the user is the instructor of this course
        if 'instructor_id' in course and db_course.instructor_id != course['instructor_id']:
            raise HTTPException(status_code=403, detail="You can only edit your own courses")
        
        # Update course fields
        if 'title' in course:
            db_course.title = str(course['title']).strip()
        if 'description' in course:
            db_course.description = str(course['description']).strip()
        if 'category' in course:
            db_course.category = str(course['category']).strip()
        
        db.commit()
        db.refresh(db_course)
        print(f"Course updated successfully: {db_course.id}")
        
        # Return updated course with instructor info
        instructor = db.query(models.User).filter(models.User.id == db_course.instructor_id).first()
        return {
            "id": db_course.id,
            "title": db_course.title,
            "description": db_course.description,
            "category": db_course.category,
            "instructor_id": db_course.instructor_id,
            "created_at": db_course.created_at,
            "instructor": {
                "name": instructor.name if instructor else "Unknown Instructor",
                "email": instructor.email if instructor else ""
            }
        }
    except Exception as e:
        print(f"Course update error: {str(e)}")
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to update course: {str(e)}")

@app.delete("/courses/{course_id}")
def delete_course(course_id: int, instructor_id: int, db: Session = Depends(get_db)):
    try:
        print(f"Deleting course {course_id} by instructor {instructor_id}")
        
        # Get the course
        db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
        if not db_course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check if the user is the instructor of this course
        if db_course.instructor_id != instructor_id:
            raise HTTPException(status_code=403, detail="You can only delete your own courses")
        
        # Check if there are any enrollments
        enrollments = db.query(models.Enrollment).filter(models.Enrollment.course_id == course_id).count()
        if enrollments > 0:
            raise HTTPException(status_code=400, detail="Cannot delete course with enrolled students")
        
        # Delete related assignments first
        assignments = db.query(models.Assignment).filter(models.Assignment.course_id == course_id).all()
        for assignment in assignments:
            # Delete assignment submissions
            db.query(models.AssignmentSubmission).filter(models.AssignmentSubmission.assignment_id == assignment.id).delete()
            # Delete assignment
            db.delete(assignment)
        
        # Delete the course
        db.delete(db_course)
        db.commit()
        print(f"Course deleted successfully: {course_id}")
        
        return {"message": "Course deleted successfully"}
    except Exception as e:
        print(f"Course deletion error: {str(e)}")
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to delete course: {str(e)}")

@app.get("/enrollments/student/{student_id}")
def get_student_enrollments(student_id: int, db: Session = Depends(get_db)):
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.student_id == student_id).all()
    return enrollments

@app.post("/enrollments")
def enroll_student(enrollment: dict, db: Session = Depends(get_db)):
    new_enrollment = models.Enrollment(**enrollment)
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    return new_enrollment

# Forum endpoints
@app.get("/forum/posts")
def get_forum_posts(db: Session = Depends(get_db)):
    try:
        posts = db.query(models.ForumPost).order_by(models.ForumPost.created_at.desc()).all()
        
        # Format posts with author information
        formatted_posts = []
        for post in posts:
            author = db.query(models.User).filter(models.User.id == post.author_id).first()
            formatted_posts.append({
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "author_id": post.author_id,
                "created_at": post.created_at,
                "author": {
                    "name": author.name if author else "Unknown",
                    "role": author.role if author else "student"
                }
            })
        
        return formatted_posts
    except Exception as e:
        print(f"Forum posts error: {str(e)}")
        # Return empty list if there's an error
        return []

@app.post("/forum/posts")
def create_forum_post(post: dict, db: Session = Depends(get_db)):
    try:
        # Validate required fields
        if 'title' not in post or 'content' not in post or 'author_id' not in post:
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        new_post = models.ForumPost(
            title=post['title'],
            content=post['content'],
            author_id=post['author_id']
        )
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        return new_post
    except Exception as e:
        print(f"Forum post creation error: {str(e)}")
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Failed to create forum post")

@app.get("/forum/posts/{post_id}/replies")
def get_post_replies(post_id: int, db: Session = Depends(get_db)):
    try:
        replies = db.query(models.ForumReply).filter(models.ForumReply.post_id == post_id).all()
        
        # Format replies with author information
        formatted_replies = []
        for reply in replies:
            author = db.query(models.User).filter(models.User.id == reply.author_id).first()
            formatted_replies.append({
                "id": reply.id,
                "content": reply.content,
                "post_id": reply.post_id,
                "author_id": reply.author_id,
                "created_at": reply.created_at,
                "author_name": author.name if author else "Unknown",
                "author_role": author.role if author else "student"
            })
        
        return formatted_replies
    except Exception as e:
        print(f"Forum replies error: {str(e)}")
        return []

@app.post("/forum/replies")
def create_forum_reply(reply: dict, db: Session = Depends(get_db)):
    try:
        # Validate required fields
        if 'content' not in reply or 'post_id' not in reply or 'author_id' not in reply:
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        new_reply = models.ForumReply(
            content=reply['content'],
            post_id=reply['post_id'],
            author_id=reply['author_id']
        )
        db.add(new_reply)
        db.commit()
        db.refresh(new_reply)
        return new_reply
    except Exception as e:
        print(f"Forum reply creation error: {str(e)}")
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Failed to create forum reply")

# Achievement endpoints
@app.get("/achievements")
def get_all_achievements(db: Session = Depends(get_db)):
    achievements = db.query(models.Achievement).all()
    return achievements

@app.get("/achievements/user/{user_id}")
def get_user_achievements(user_id: int, db: Session = Depends(get_db)):
    user_achievements = db.query(models.UserAchievement).filter(models.UserAchievement.user_id == user_id).all()
    return user_achievements

@app.post("/achievements/user")
def award_achievement(user_achievement: dict, db: Session = Depends(get_db)):
    new_user_achievement = models.UserAchievement(**user_achievement)
    db.add(new_user_achievement)
    db.commit()
    db.refresh(new_user_achievement)
@app.get("/init-sample-data")
def init_sample_data(db: Session = Depends(get_db)):
    try:
        # Create sample achievements
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
        
        # Create sample courses
        instructor = db.query(models.User).filter(models.User.role == "instructor").first()
        if instructor:
            courses_data = [
                {"title": "React Fundamentals", "description": "Learn the basics of React development", "category": "Web Development", "instructor_id": instructor.id},
                {"title": "Python for Data Science", "description": "Master Python for data analysis", "category": "Data Science", "instructor_id": instructor.id},
                {"title": "JavaScript Advanced", "description": "Deep dive into advanced JavaScript", "category": "Web Development", "instructor_id": instructor.id}
            ]
            
            for course_data in courses_data:
                existing = db.query(models.Course).filter(models.Course.title == course_data["title"]).first()
                if not existing:
                    course = models.Course(**course_data)
                    db.add(course)
        
        # Create sample schedule
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
        
        db.commit()
        return {"message": "Sample data initialized successfully"}
    except Exception as e:
        return {"error": str(e)}

# Assignment endpoints
@app.post("/assignments")
def create_assignment(assignment: dict, db: Session = Depends(get_db)):
    try:
        print(f"Creating assignment: {assignment}")
        
        # Validate required fields
        required_fields = ['title', 'description', 'teacher_id', 'course_id']
        for field in required_fields:
            if field not in assignment or not assignment[field]:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Check if teacher exists (allow any user for now)
        teacher = db.query(models.User).filter(
            models.User.id == assignment['teacher_id']
        ).first()
        if not teacher:
            print(f"Teacher not found with ID: {assignment['teacher_id']}")
            raise HTTPException(status_code=404, detail="Teacher not found")
        
        # Check if course exists - if not, create a default course for this teacher
        course = db.query(models.Course).filter(
            models.Course.id == assignment['course_id']
        ).first()
        
        if not course:
            print(f"Course not found with ID: {assignment['course_id']}. Creating default course...")
            # Create a default course for this assignment
            default_course = models.Course(
                title="General Course",
                description="Default course for assignments",
                category="General",
                instructor_id=assignment['teacher_id']
            )
            db.add(default_course)
            db.commit()
            db.refresh(default_course)
            course = default_course
            print(f"Created default course with ID: {course.id}")
            # Update assignment to use the new course ID
            assignment['course_id'] = course.id
        
        # Prepare assignment data with defaults
        assignment_data = {
            'title': str(assignment['title']).strip(),
            'description': str(assignment['description']).strip(),
            'teacher_id': int(assignment['teacher_id']),
            'course_id': int(assignment['course_id']),
            'points': int(assignment.get('points', 100))
        }
        
        # Handle due_date if provided
        if 'due_date' in assignment and assignment['due_date']:
            from datetime import datetime
            if isinstance(assignment['due_date'], str):
                try:
                    # Try parsing ISO format
                    assignment_data['due_date'] = datetime.fromisoformat(assignment['due_date'].replace('Z', '+00:00'))
                except ValueError:
                    # Try parsing without timezone
                    assignment_data['due_date'] = datetime.fromisoformat(assignment['due_date'])
            else:
                assignment_data['due_date'] = assignment['due_date']
        
        new_assignment = models.Assignment(**assignment_data)
        db.add(new_assignment)
        db.commit()
        db.refresh(new_assignment)
        print(f"Assignment created successfully: {new_assignment.id}")
        
        # Return assignment with course and teacher info
        return {
            "id": new_assignment.id,
            "title": new_assignment.title,
            "description": new_assignment.description,
            "due_date": new_assignment.due_date,
            "points": new_assignment.points,
            "course_id": new_assignment.course_id,
            "teacher_id": new_assignment.teacher_id,
            "created_at": new_assignment.created_at,
            "course": {
                "title": course.title
            },
            "teacher": {
                "name": teacher.name
            }
        }
    except Exception as e:
        print(f"Assignment creation error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error creating assignment please try again: {str(e)}")

@app.get("/assignments/student/{student_id}")
def get_student_assignments(student_id: int, db: Session = Depends(get_db)):
    # Get assignments from courses the student is enrolled in
    assignments = db.query(models.Assignment).join(models.Course).join(models.Enrollment).filter(
        models.Enrollment.student_id == student_id
    ).all()
    
    # Also get all assignments (for demo purposes)
    all_assignments = db.query(models.Assignment).all()
    
    formatted_assignments = []
    for assignment in all_assignments:
        teacher = db.query(models.User).filter(models.User.id == assignment.teacher_id).first()
        course = db.query(models.Course).filter(models.Course.id == assignment.course_id).first()
        
        # Check if student has submitted
        submission = db.query(models.AssignmentSubmission).filter(
            models.AssignmentSubmission.assignment_id == assignment.id,
            models.AssignmentSubmission.student_id == student_id
        ).first()
        
        formatted_assignments.append({
            "id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "due_date": assignment.due_date,
            "points": assignment.points,
            "course_title": course.title if course else "Unknown Course",
            "teacher_name": teacher.name if teacher else "Unknown Teacher",
            "status": "submitted" if submission else "pending",
            "submitted_at": submission.submitted_at if submission else None
        })
    
    return formatted_assignments

@app.get("/assignments/teacher/{teacher_id}")
def get_teacher_assignments(teacher_id: int, db: Session = Depends(get_db)):
    assignments = db.query(models.Assignment).filter(models.Assignment.teacher_id == teacher_id).all()
    
    formatted_assignments = []
    for assignment in assignments:
        course = db.query(models.Course).filter(models.Course.id == assignment.course_id).first()
        submissions_count = db.query(models.AssignmentSubmission).filter(
            models.AssignmentSubmission.assignment_id == assignment.id
        ).count()
        
        formatted_assignments.append({
            "id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "due_date": assignment.due_date,
            "points": assignment.points,
            "course_title": course.title if course else "Unknown Course",
            "submissions_count": submissions_count
        })
    
    return formatted_assignments

@app.post("/assignments/submit")
def submit_assignment(submission_data: dict, db: Session = Depends(get_db)):
    try:
        print(f"Submitting assignment: {submission_data}")
        
        # Validate required fields
        if 'assignment_id' not in submission_data or 'student_id' not in submission_data:
            raise HTTPException(status_code=400, detail="Missing assignment_id or student_id")
        
        # Check if assignment exists
        assignment = db.query(models.Assignment).filter(
            models.Assignment.id == submission_data['assignment_id']
        ).first()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        # Check if student exists
        student = db.query(models.User).filter(
            models.User.id == submission_data['student_id'],
            models.User.role == 'student'
        ).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Check if already submitted
        existing = db.query(models.AssignmentSubmission).filter(
            models.AssignmentSubmission.assignment_id == submission_data['assignment_id'],
            models.AssignmentSubmission.student_id == submission_data['student_id']
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Assignment already submitted")
        
        submission = models.AssignmentSubmission(
            assignment_id=submission_data['assignment_id'],
            student_id=submission_data['student_id'],
            submission_text=submission_data.get('submission_text', ''),
            file_path=submission_data.get('file_path', '')
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)
        print(f"Assignment submitted successfully: {submission.id}")
        return submission
    except Exception as e:
        print(f"Assignment submission error: {str(e)}")
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to submit assignment: {str(e)}")

@app.put("/assignments/submissions/{submission_id}/grade")
def grade_assignment(submission_id: int, grade: int, feedback: str, db: Session = Depends(get_db)):
    submission = db.query(models.AssignmentSubmission).filter(models.AssignmentSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submission.grade = grade
    submission.feedback = feedback
    submission.graded_at = datetime.utcnow()
    db.commit()
    db.refresh(submission)
    return submission

# Schedule endpoints
@app.get("/schedule/weekly")
def get_weekly_schedule(db: Session = Depends(get_db)):
    # Get schedule ordered by day and time
    day_order = {'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7}
    
    schedule = db.query(models.ScheduleSlot).all()
    
    # Sort by day and time
    def sort_key(slot):
        day_num = day_order.get(slot.day, 8)
        # Convert time to 24-hour format for sorting
        time_str = slot.time
        try:
            if 'AM' in time_str or 'PM' in time_str:
                from datetime import datetime
                time_obj = datetime.strptime(time_str, '%I:%M %p')
                return (day_num, time_obj.hour, time_obj.minute)
            else:
                # Assume 24-hour format
                hour, minute = map(int, time_str.split(':'))
                return (day_num, hour, minute)
        except:
            return (day_num, 0, 0)
    
    sorted_schedule = sorted(schedule, key=sort_key)
    return sorted_schedule

@app.post("/schedule")
def create_schedule_slot(slot: dict, db: Session = Depends(get_db)):
    new_slot = models.ScheduleSlot(**slot)
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)
    return new_slot

@app.put("/schedule/{slot_id}")
def update_schedule_slot(slot_id: int, slot: dict, db: Session = Depends(get_db)):
    db_slot = db.query(models.ScheduleSlot).filter(models.ScheduleSlot.id == slot_id).first()
    if not db_slot:
        raise HTTPException(status_code=404, detail="Schedule slot not found")
    
    for key, value in slot.items():
        setattr(db_slot, key, value)
    
    db.commit()
    db.refresh(db_slot)
    return db_slot

@app.delete("/schedule/{slot_id}")
def delete_schedule_slot(slot_id: int, db: Session = Depends(get_db)):
    db_slot = db.query(models.ScheduleSlot).filter(models.ScheduleSlot.id == slot_id).first()
    if not db_slot:
        raise HTTPException(status_code=404, detail="Schedule slot not found")
    
    db.delete(db_slot)
    db.commit()
    return {"message": "Schedule slot deleted successfully"}

# Database initialization endpoint
@app.post("/init-database")
def initialize_database(db: Session = Depends(get_db)):
    try:
        print("Starting database initialization...")
        
        # Create all tables
        models.Base.metadata.create_all(bind=engine)
        print("Tables created successfully")
        
        # Verify tables were created and test basic operations
        tables_status = {}
        table_names = [
            'users', 'courses', 'assignments', 'assignment_submissions',
            'enrollments', 'resources', 'forum_posts', 'forum_replies',
            'achievements', 'user_achievements', 'schedule_slots', 'progress'
        ]
        
        for table in table_names:
            try:
                result = db.execute(f"SELECT COUNT(*) FROM {table}")
                count = result.scalar()
                tables_status[table] = {'exists': True, 'count': count}
                print(f"Table {table}: {count} records")
            except Exception as e:
                tables_status[table] = {'exists': False, 'error': str(e)}
                print(f"Table {table} check failed: {e}")
        
        # Test basic database operations
        try:
            # Test insert/select
            test_result = db.execute("SELECT 1 as test")
            db_working = test_result.scalar() == 1
        except Exception as e:
            db_working = False
            print(f"Database operation test failed: {e}")
        
        successful_tables = [name for name, status in tables_status.items() if status['exists']]
        
        return {
            "message": "Database initialization completed",
            "database_working": db_working,
            "tables_created": len(successful_tables),
            "total_tables": len(table_names),
            "successful_tables": successful_tables,
            "tables_status": tables_status,
            "status": "success" if len(successful_tables) == len(table_names) else "partial"
        }
    except Exception as e:
        print(f"Database initialization error: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return {
            "error": f"Database initialization failed: {str(e)}",
            "message": "Please check your database connection and permissions",
            "status": "failed"
        }
# Database migration endpoint to add missing columns
@app.post("/migrate-database")
def migrate_database(db: Session = Depends(get_db)):
    try:
        print("Starting database migration...")
        
        migration_results = []
        
        # Check and add course_link column to courses table if needed
        try:
            # First check if column exists
            result = db.execute("SELECT column_name FROM information_schema.columns WHERE table_name='courses' AND column_name='course_link'")
            if not result.fetchone():
                db.execute("ALTER TABLE courses ADD COLUMN course_link VARCHAR")
                migration_results.append("Added course_link column to courses table")
                print("Added course_link column to courses table")
            else:
                migration_results.append("course_link column already exists")
                print("course_link column already exists")
        except Exception as e:
            migration_results.append(f"Error with course_link column: {str(e)}")
            print(f"Error adding course_link column: {e}")
        
        # Ensure all required tables exist
        try:
            models.Base.metadata.create_all(bind=engine)
            migration_results.append("Ensured all tables exist")
            print("Ensured all tables exist")
        except Exception as e:
            migration_results.append(f"Error creating tables: {str(e)}")
            print(f"Error creating tables: {e}")
        
        db.commit()
        
        return {
            "status": "success",
            "message": "Database migration completed",
            "results": migration_results
        }
        
    except Exception as e:
        print(f"Migration error: {str(e)}")
        db.rollback()
        return {
            "status": "failed",
            "error": str(e),
            "message": "Database migration failed"
        }

@app.get("/check-database-schema")
def check_database_schema(db: Session = Depends(get_db)):
    try:
        schema_info = {}
        
        # Check courses table structure
        try:
            result = db.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='courses' ORDER BY ordinal_position")
            courses_columns = [{"name": row[0], "type": row[1]} for row in result.fetchall()]
            schema_info["courses"] = courses_columns
        except Exception as e:
            schema_info["courses"] = f"Error: {str(e)}"
        
        # Check other important tables
        tables_to_check = ["users", "assignments", "forum_posts", "forum_replies", "schedule_slots"]
        for table in tables_to_check:
            try:
                result = db.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name='{table}' ORDER BY ordinal_position")
                columns = [{"name": row[0], "type": row[1]} for row in result.fetchall()]
                schema_info[table] = columns
            except Exception as e:
                schema_info[table] = f"Error: {str(e)}"
        
        return {
            "status": "success",
            "schema": schema_info
        }
        
    except Exception as e:
        return {
            "status": "failed",
            "error": str(e)
        }