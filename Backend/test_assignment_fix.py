#!/usr/bin/env python3
"""
Test Assignment Creation with PostgreSQL
This script tests the assignment creation fix
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_assignment_creation():
    """Test assignment creation with course auto-creation"""
    print("🧪 Testing Assignment Creation Fix...")
    print("=" * 50)
    
    # First, let's see what courses exist
    print("1. Checking existing courses...")
    try:
        response = requests.get(f"{BASE_URL}/courses")
        if response.status_code == 200:
            courses = response.json()
            print(f"   Found {len(courses)} courses:")
            for course in courses:
                print(f"   - ID: {course.get('id')}, Title: {course.get('title')}")
        else:
            print(f"   ❌ Failed to get courses: {response.status_code}")
            courses = []
    except Exception as e:
        print(f"   ❌ Error getting courses: {e}")
        courses = []
    
    print()
    
    # Test assignment creation
    print("2. Testing assignment creation...")
    assignment_data = {
        "title": "Test Assignment - React Components",
        "description": "A test assignment to verify the fix works",
        "due_date": "2024-12-31T23:59:00",
        "points": 100,
        "course_id": 1,  # This might not exist, but should auto-create
        "teacher_id": 2   # Assuming instructor has ID 2
    }
    
    try:
        print(f"   Sending assignment data: {assignment_data}")
        response = requests.post(f"{BASE_URL}/assignments", json=assignment_data)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Assignment created successfully!")
            print(f"   - Assignment ID: {data.get('id')}")
            print(f"   - Title: {data.get('title')}")
            print(f"   - Course ID: {data.get('course_id')}")
            print(f"   - Course Title: {data.get('course', {}).get('title')}")
            return True
        else:
            print(f"   ❌ Assignment creation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Assignment creation error: {e}")
        return False

def test_course_creation():
    """Test course creation"""
    print("3. Testing course creation...")
    course_data = {
        "title": "Test Course - PostgreSQL Fix",
        "description": "A test course to verify course creation works",
        "category": "Testing",
        "instructor_id": 2  # Assuming instructor has ID 2
    }
    
    try:
        print(f"   Sending course data: {course_data}")
        response = requests.post(f"{BASE_URL}/courses", json=course_data)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Course created successfully!")
            print(f"   - Course ID: {data.get('id')}")
            print(f"   - Title: {data.get('title')}")
            return data.get('id')
        else:
            print(f"   ❌ Course creation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"   ❌ Course creation error: {e}")
        return None

def test_with_real_course():
    """Test assignment creation with a real course"""
    print("4. Testing assignment with real course...")
    
    # First create a course
    course_id = test_course_creation()
    if not course_id:
        print("   ⚠️ Skipping test - couldn't create course")
        return False
    
    # Now create assignment with the real course
    assignment_data = {
        "title": "Real Course Assignment",
        "description": "Assignment for the real course we just created",
        "due_date": "2024-12-31T23:59:00",
        "points": 150,
        "course_id": course_id,
        "teacher_id": 2
    }
    
    try:
        response = requests.post(f"{BASE_URL}/assignments", json=assignment_data)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Assignment with real course created!")
            print(f"   - Assignment ID: {data.get('id')}")
            print(f"   - Course ID: {data.get('course_id')}")
            return True
        else:
            print(f"   ❌ Failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    print("🔧 PostgreSQL Assignment Creation Fix Test")
    print("=" * 50)
    print()
    
    # Test 1: Assignment creation (might auto-create course)
    test1_result = test_assignment_creation()
    print()
    
    # Test 2: Assignment with real course
    test2_result = test_with_real_course()
    print()
    
    # Summary
    print("=" * 50)
    print("📊 Test Results Summary:")
    print(f"Assignment Creation (auto-course): {'✅ PASS' if test1_result else '❌ FAIL'}")
    print(f"Assignment with Real Course: {'✅ PASS' if test2_result else '❌ FAIL'}")
    print()
    
    if test1_result and test2_result:
        print("🎉 ALL TESTS PASSED! Assignment creation is working!")
        print("✅ The 'Course not found' error has been fixed!")
    else:
        print("⚠️ Some tests failed. Check the backend server logs.")
    
    return test1_result and test2_result

if __name__ == "__main__":
    success = main()
    input("\nPress Enter to exit...")
    exit(0 if success else 1)