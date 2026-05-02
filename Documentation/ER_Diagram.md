# EduHub - Entity Relationship (ER) Diagram

## Entities and Attributes:

### 1. USER
- **Primary Key**: user_id (INT)
- name (VARCHAR)
- email (VARCHAR) - UNIQUE
- hashed_password (VARCHAR)
- role (VARCHAR) - 'student', 'instructor', 'admin'
- is_active (BOOLEAN)

### 2. RESOURCE
- **Primary Key**: resource_id (INT)
- title (VARCHAR)
- url (VARCHAR)
- resource_type (VARCHAR) - 'YouTube', 'PDF', 'GitHub', 'Website'
- category (VARCHAR)
- is_public (BOOLEAN)
- **Foreign Key**: owner_id (INT) → USER(user_id)

### 3. LEARNING_PROGRESS
- **Primary Key**: progress_id (INT)
- total_time_seconds (INT)
- last_position (VARCHAR)
- **Foreign Key**: user_id (INT) → USER(user_id)
- **Foreign Key**: resource_id (INT) → RESOURCE(resource_id)

## Relationships:

1. **USER → RESOURCE** (One-to-Many)
   - One user can own multiple resources
   - Relationship: "owns"

2. **USER → LEARNING_PROGRESS** (One-to-Many)
   - One user can have multiple learning progress records
   - Relationship: "tracks"

3. **RESOURCE → LEARNING_PROGRESS** (One-to-Many)
   - One resource can have multiple progress records from different users
   - Relationship: "monitored_by"

## Cardinality:
- USER (1) ---- (M) RESOURCE
- USER (1) ---- (M) LEARNING_PROGRESS  
- RESOURCE (1) ---- (M) LEARNING_PROGRESS