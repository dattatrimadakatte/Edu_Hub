# EduHub - Data Flow Diagram (DFD)

## Level 0 DFD (Context Diagram):

### External Entities:
1. **Student**
2. **Instructor** 
3. **Admin**

### System: EduHub Learning Management System

### Data Flows:
- Student → System: Registration Data, Login Credentials, Resource Data
- System → Student: Dashboard Data, Resource List, Progress Reports
- Instructor → System: Course Resources, Login Credentials
- System → Instructor: Student Statistics, Course Analytics
- Admin → System: Admin Credentials, User Management Commands
- System → Admin: System Statistics, User Lists

## Level 1 DFD (System Decomposition):

### Processes:
1. **P1: User Authentication**
   - Input: Login credentials
   - Output: Authentication token, User data
   
2. **P2: User Registration**
   - Input: Registration data
   - Output: New user account
   
3. **P3: Resource Management**
   - Input: Resource data (CRUD operations)
   - Output: Updated resource list
   
4. **P4: Dashboard Generation**
   - Input: User ID, Role
   - Output: Personalized dashboard data
   
5. **P5: Progress Tracking**
   - Input: User activity, Resource usage
   - Output: Learning progress data
   
6. **P6: Admin Management**
   - Input: Admin commands
   - Output: System reports, User management results

### Data Stores:
1. **D1: Users Database**
   - Stores: User profiles, credentials, roles
   
2. **D2: Resources Database**
   - Stores: Learning resources, metadata
   
3. **D3: Progress Database**
   - Stores: Learning progress, time tracking

### Data Flows Between Processes:
- P1 → P4: Authenticated user data
- P2 → D1: New user data
- P3 → D2: Resource CRUD operations
- P4 → D1, D2, D3: Data retrieval for dashboard
- P5 → D3: Progress updates
- P6 → D1: User management operations

## Level 2 DFD (Process Decomposition):

### P3: Resource Management (Detailed):
- **P3.1: Create Resource**
- **P3.2: Read Resources**
- **P3.3: Update Resource**
- **P3.4: Delete Resource**
- **P3.5: Filter Resources**

### P4: Dashboard Generation (Detailed):
- **P4.1: Generate Student Dashboard**
- **P4.2: Generate Instructor Dashboard**
- **P4.3: Generate Admin Dashboard**
- **P4.4: Calculate Statistics**