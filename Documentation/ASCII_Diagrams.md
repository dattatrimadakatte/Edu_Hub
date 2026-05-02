# EduHub - ASCII Art Diagrams

## ER Diagram (Simplified)
```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│      USER       │         │    RESOURCE     │         │LEARNING_PROGRESS│
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ PK: user_id     │    1    │ PK: resource_id │    1    │ PK: progress_id │
│    name         │────────▶│    title        │────────▶│    user_id (FK) │
│    email        │  owns   │    url          │monitored│    resource_id  │
│    password     │         │    type         │   by    │    time_seconds │
│    role         │         │    category     │         │    position     │
│    is_active    │         │    is_public    │         │                 │
│                 │         │    owner_id(FK) │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         │                                                        ▲
         │                           M                            │
         └────────────────────────────────────────────────────────┘
                              tracks
```

## Use Case Diagram (Simplified)
```
    Student                    Instructor                   Admin
      │                          │                          │
      ├─ Register Account        ├─ Register as Instructor  ├─ Admin Login
      ├─ Login to System         ├─ Login to System         ├─ View System Dashboard
      ├─ View Dashboard          ├─ View Teacher Dashboard  ├─ Manage Users
      ├─ Manage Resources        ├─ Manage Course Resources ├─ System Administration
      ├─ Browse Public Resources ├─ Monitor Student Progress│
      └─ Track Progress          └─                         └─
                │                          │                          │
                └──────────────────────────┼──────────────────────────┘
                                          │
                                   ┌─────────────┐
                                   │ Authenticate│
                                   │    User     │
                                   └─────────────┘
```

## DFD Level 0 (Context Diagram)
```
    ┌─────────┐                                           ┌─────────┐
    │ Student │────── Registration, Login, Resources ────▶│         │
    │         │◀───── Dashboard, Progress Reports ────────│         │
    └─────────┘                                           │         │
                                                          │ EduHub  │
    ┌─────────┐                                           │ System  │
    │Instructor│────── Course Resources, Login ──────────▶│         │
    │         │◀───── Analytics, Statistics ──────────────│         │
    └─────────┘                                           │         │
                                                          │         │
    ┌─────────┐                                           │         │
    │  Admin  │────── Admin Commands, Login ─────────────▶│         │
    │         │◀───── System Reports, User Lists ─────────│         │
    └─────────┘                                           └─────────┘
```

## DFD Level 1 (System Processes)
```
External Entities:    Processes:              Data Stores:
┌─────────┐          ┌─────────┐              ┌─────────┐
│ Student │──────────│P1: Auth │──────────────│D1: Users│
└─────────┘          └─────────┘              └─────────┘
                            │                        │
┌─────────┐          ┌─────────┐              ┌─────────┐
│Instructor│─────────│P2: Reg  │──────────────│D2: Res  │
└─────────┘          └─────────┘              └─────────┘
                            │                        │
┌─────────┐          ┌─────────┐              ┌─────────┐
│  Admin  │──────────│P3: ResMgr│──────────────│D3: Prog │
└─────────┘          └─────────┘              └─────────┘
                            │
                     ┌─────────┐
                     │P4: Dash │
                     └─────────┘
                            │
                     ┌─────────┐
                     │P5: Track│
                     └─────────┘
                            │
                     ┌─────────┐
                     │P6: Admin│
                     └─────────┘
```