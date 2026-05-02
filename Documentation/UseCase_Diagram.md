# EduHub - Use Case Diagram

## Actors:

### 1. Student
### 2. Instructor (Teacher)
### 3. Admin

## Use Cases:

### Student Use Cases:
1. **Register Account**
   - Student creates new account with email and password
   
2. **Login to System**
   - Student authenticates with credentials
   
3. **View Dashboard**
   - Student sees personal statistics and progress
   
4. **Manage Personal Resources**
   - Add new learning resources
   - Edit existing resources
   - Delete resources
   - View resource list
   
5. **Browse Public Resources**
   - View resources shared by instructors
   - Filter resources by category
   
6. **Track Learning Progress**
   - System tracks time spent on resources
   - View learning statistics

### Instructor Use Cases:
1. **Register as Instructor**
   - Instructor creates account with teacher role
   
2. **Login to System**
   - Instructor authenticates with credentials
   
3. **View Teacher Dashboard**
   - See course statistics and student metrics
   
4. **Manage Course Resources**
   - Create educational resources
   - Edit resource content
   - Delete resources
   - Make resources public for students
   
5. **Monitor Student Progress**
   - View student engagement statistics
   - Track resource usage

### Admin Use Cases:
1. **Admin Login**
   - Admin authenticates with special credentials
   
2. **View System Dashboard**
   - Monitor overall system statistics
   - View user counts and resource metrics
   
3. **Manage Users**
   - View all system users
   - Activate/Deactivate user accounts
   - Delete user accounts
   
4. **System Administration**
   - Monitor system health
   - Manage system settings

## Relationships:
- **Inheritance**: Student and Instructor inherit from User
- **Include**: All login use cases include "Authenticate User"
- **Extend**: "Track Progress" extends "View Resources"