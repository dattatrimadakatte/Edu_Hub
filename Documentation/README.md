# EduHub Project - Diagram Documentation

## Project Overview:
EduHub is a Learning Management System with three types of users:
- **Students**: Manage personal learning resources and track progress
- **Instructors**: Create and share educational content, monitor student progress  
- **Admins**: Manage users and oversee system operations

## Technology Stack:
- **Frontend**: React.js with Vite
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Authentication**: SHA-256 password hashing

## How to Draw the Diagrams:

### 1. ER Diagram:
- Draw rectangles for entities (USER, RESOURCE, LEARNING_PROGRESS)
- Draw ovals for attributes, underline primary keys
- Draw diamonds for relationships with cardinality labels
- Connect with lines showing foreign key relationships

### 2. Use Case Diagram:
- Draw stick figures for actors (Student, Instructor, Admin)
- Draw ovals for use cases
- Use lines to connect actors to their use cases
- Show inheritance with arrows (Student, Instructor inherit from User)
- Use <<include>> and <<extend>> for relationships

### 3. DFD Diagrams:
- **Level 0**: One circle for the system, rectangles for external entities
- **Level 1**: Multiple circles for processes, open rectangles for data stores
- **Level 2**: Decompose complex processes into sub-processes
- Use arrows with labels for data flows

## Tools Recommended:
- **Draw.io** (free online tool)
- **Lucidchart**
- **Microsoft Visio**
- **PlantUML** (for text-based diagrams)

## Files Created:
1. `ER_Diagram.md` - Entity Relationship specifications
2. `UseCase_Diagram.md` - Use Case specifications  
3. `DFD_Diagram.md` - Data Flow Diagram specifications
4. `README.md` - This overview file

Use these specifications to create the actual visual diagrams for your college submission.