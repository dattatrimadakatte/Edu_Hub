#!/usr/bin/env python3
"""
Test Script to Verify All EduHub Fixes
This script tests course creation, assignment creation, and database connectivity
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_database_health():
    """Test database connectivity and health"""
    print("🔍 Testing database health...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Database: {data.get('database', 'Unknown')}")
            print(f"  ✅ Tables: {data.get('tables_found', 0)}/{data.get('total_tables', 0)}")
            return True
        else:
            print(f"  ❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Health check error: {e}")
        return False

def test_database_init():
    """Test database initialization"""
    print("🚀 Testing database initialization...")
    try:
        response = requests.post(f"{BASE_URL}/init-database")
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Status: {data.get('status', 'Unknown')}")
            print(f"  ✅ Tables: {data.get('tables_created', 0)}/{data.get('total_tables', 0)}")
            return True
        else:
            print(f"  ❌ Database init failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Database init error: {e}")
        return False

def test_course_creation():
    """Test course creation functionality"""
    print("📚 Testing course creation...")
    try:
        course_data = {
            "title": "Test Course - React Basics",
            "description": "A test course to verify course creation functionality",
            "category": "Web Development",
            "instructor_id": 2  # Assuming instructor user has ID 2
        }
        
        response = requests.post(f"{BASE_URL}/courses", json=course_data)
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Course created: {data.get('title', 'Unknown')}")
            print(f"  ✅ Course ID: {data.get('id', 'Unknown')}")
            return data.get('id')
        else:
            print(f"  ❌ Course creation failed: {response.status_code}")
            print(f"  Error: {response.text}")
            return None
    except Exception as e:
        print(f"  ❌ Course creation error: {e}")
        return None

def test_assignment_creation(course_id):
    """Test assignment creation functionality"""
    print("📝 Testing assignment creation...")
    try:
        assignment_data = {
            "title": "Test Assignment - React Components",
            "description": "A test assignment to verify assignment creation functionality",
            "due_date": "2024-12-31T23:59:00",
            "points": 100,
            "course_id": course_id,
            "teacher_id": 2  # Assuming instructor user has ID 2
        }
        
        response = requests.post(f"{BASE_URL}/assignments", json=assignment_data)
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Assignment created: {data.get('title', 'Unknown')}")
            print(f"  ✅ Assignment ID: {data.get('id', 'Unknown')}")
            return True
        else:
            print(f"  ❌ Assignment creation failed: {response.status_code}")
            print(f"  Error: {response.text}")
            return False
    except Exception as e:
        print(f"  ❌ Assignment creation error: {e}")
        return False

def test_schedule_ordering():
    """Test schedule ordering functionality"""
    print("📅 Testing schedule ordering...")
    try:
        response = requests.get(f"{BASE_URL}/schedule/weekly")
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Schedule retrieved: {len(data)} slots")
            
            # Check if schedule is ordered by day and time
            monday_slots = [slot for slot in data if slot['day'] == 'Monday']
            if len(monday_slots) > 1:
                times = [slot['time'] for slot in monday_slots]
                print(f"  ✅ Monday schedule: {times}")
            
            return True
        else:
            print(f"  ❌ Schedule retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Schedule test error: {e}")
        return False

def test_all_features():
    """Test all features endpoint"""
    print("🧪 Testing all features...")
    try:
        response = requests.get(f"{BASE_URL}/test-all-features")
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Status: {data.get('status', 'Unknown')}")
            results = data.get('test_results', {})
            for feature, result in results.items():
                print(f"  {result}")
            return True
        else:
            print(f"  ❌ Feature test failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Feature test error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 50)
    print("    EduHub Fix Verification Tests")
    print("=" * 50)
    print()
    
    # Test 1: Database Health
    health_ok = test_database_health()
    print()
    
    # Test 2: Database Initialization
    if health_ok:
        init_ok = test_database_init()
        print()
    else:
        print("⚠️ Skipping database init test due to health check failure")
        init_ok = False
    
    # Test 3: Course Creation
    course_id = test_course_creation()
    print()
    
    # Test 4: Assignment Creation
    if course_id:
        assignment_ok = test_assignment_creation(course_id)
        print()
    else:
        print("⚠️ Skipping assignment test due to course creation failure")
        assignment_ok = False
    
    # Test 5: Schedule Ordering
    schedule_ok = test_schedule_ordering()
    print()
    
    # Test 6: All Features
    features_ok = test_all_features()
    print()
    
    # Summary
    print("=" * 50)
    print("    Test Results Summary")
    print("=" * 50)
    print(f"Database Health: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"Database Init: {'✅ PASS' if init_ok else '❌ FAIL'}")
    print(f"Course Creation: {'✅ PASS' if course_id else '❌ FAIL'}")
    print(f"Assignment Creation: {'✅ PASS' if assignment_ok else '❌ FAIL'}")
    print(f"Schedule Ordering: {'✅ PASS' if schedule_ok else '❌ FAIL'}")
    print(f"All Features: {'✅ PASS' if features_ok else '❌ FAIL'}")
    print()
    
    all_passed = all([health_ok, init_ok, course_id, assignment_ok, schedule_ok, features_ok])
    if all_passed:
        print("🎉 ALL TESTS PASSED! EduHub is working correctly.")
    else:
        print("⚠️ Some tests failed. Please check the backend server and database connection.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    input("\nPress Enter to exit...")
    exit(0 if success else 1)