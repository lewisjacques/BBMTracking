# Fitness Program - Project Structure

## Overview

This is a unified full-stack fitness tracking application combining Django REST Framework backend with React frontend in a single repository structure.

## Directory Layout

```
program_viewer/
│
├── 📁 api/                              # Django REST Framework endpoints
│   ├── __init__.py
│   ├── views.py                         # ViewSets for Exercise, Session, etc.
│   ├── serialisers.py                   # Serializers (Detail & Create versions)
│   └── urls.py                          # DRF router configuration
│
├── 📁 base/                             # Core Django app with models
│   ├── models.py                        # Exercise, Session, SessionEntry, MuscleGroup, ExerciseType
│   ├── admin.py                         # Django admin configuration
│   ├── apps.py
│   ├── views.py
│   ├── tests.py
│   ├── management/commands/
│   │   └── import_sessions.py           # CSV import management command
│   ├── helper_functions/
│   │   └── legacy_data_handling.py      # Data transformation utilities
│   └── migrations/                      # Database migrations
│
├── 📁 program_viewer/                   # Django project settings
│   ├── __init__.py
│   ├── settings.py                      # Django configuration
│   ├── urls.py                          # URL routing (includes DRF routes)
│   ├── wsgi.py                          # WSGI entry point
│   └── asgi.py                          # ASGI entry point
│
├── 📁 frontend/                         # React + TypeScript frontend
│   ├── 📁 src/
│   │   ├── 📁 api/
│   │   │   └── client.ts                # TypeScript API client with interfaces
│   │   ├── 📁 components/
│   │   │   └── ui/
│   │   │       ├── button.tsx           # Reusable Button component
│   │   │       └── table.tsx            # Reusable Table component
│   │   ├── 📁 views/
│   │   │   ├── DayView.tsx              # Day-level detailed view
│   │   │   └── WeekView.tsx             # Week-level summary view
│   │   ├── App.tsx                      # Main app component
│   │   ├── main.tsx                     # React entry point
│   │   └── index.css                    # Tailwind CSS directives
│   │
│   ├── 📁 node_modules/                 # npm dependencies (gitignored)
│   ├── index.html                       # HTML entry point
│   ├── package.json                     # Dependencies: React, Vite, Tailwind, etc.
│   ├── vite.config.ts                   # Vite build config (port 5173, proxy)
│   ├── tsconfig.json                    # TypeScript config
│   ├── tsconfig.node.json               # TypeScript Node config
│   ├── tailwind.config.js               # Tailwind CSS config
│   ├── postcss.config.js                # PostCSS plugins
│   └── .gitignore                       # Frontend-specific ignores
│
├── 📁 _legacy/                          # Historical data for import
│   ├── exercises.csv
│   └── session_data_lew.csv
│
├── 📁 .git/                             # Git repository
├── manage.py                            # Django CLI entry point
├── db.sqlite3                           # Development database
├── .gitignore                           # Project-wide ignores
└── README.md                            # Project documentation
```

## Key Features

### Backend (Django + REST Framework)

**Models** (`base/models.py`):
- `MuscleGroup` - Muscle group names (Back, Chest, Legs, etc.)
- `ExerciseType` - Equipment types (Barbell, Dumbbell, Cable, Machine, etc.)
- `Exercise` - Exercise with FK to MuscleGroup & ExerciseType
- `Session` - Workout session with date, notes, completion status
- `SessionEntry` - Individual exercise within a session (FK to Session & Exercise)

**ViewSets** (`api/views.py`):
- `ExerciseViewSet` - Full CRUD with filtering by muscle_group, exercise_type, search
- `SessionViewSet` - Full CRUD with date range filtering, status filtering
- `SessionEntryViewSet` - Add/remove exercises from sessions
- `MuscleGroupViewSet` - Read-only list of muscle groups

**Serializers** (`api/serialisers.py`):
- Split into Detail (for GET) and Create (for POST/PUT) versions
- Validation and nested relationships
- Proper error handling

**Data Import** (`base/management/commands/import_sessions.py`):
- Imports historical CSV data
- Creates/updates Exercise, Session, SessionEntry records
- Handles MuscleGroup and ExerciseType creation

### Frontend (React + TypeScript)

**Main Component** (`App.tsx`):
- Day/Week view toggle buttons
- Date navigation (previous/next)
- Responsive header

**Day View** (`views/DayView.tsx`):
- Detailed exercise table for a single day
- Summary cards (total exercises, sessions, completed)
- Columns: Exercise, Muscle Group, Type, Weight, Status
- Add/Delete exercise buttons
- Loading and error states

**Week View** (`views/WeekView.tsx`):
- 7-day grid overview
- Daily stats: exercises, muscle groups, completion
- Week summary: total exercises, days worked, completed days
- Muscle group distribution chart
- Color highlighting for today and workout days

**API Client** (`src/api/client.ts`):
- TypeScript interfaces for all data types
- Fetch functions with proper error handling
- Support for filtering, pagination, sorting
- Functions: `fetchSessions()`, `fetchExercises()`, `fetchMuscleGroups()`, etc.

**UI Components**:
- `Button.tsx` - 6 variants (default, destructive, outline, secondary, ghost, link)
- `Table.tsx` - Full table component with header, body, row, cell parts

## API Endpoints

All endpoints at `http://localhost:8000/`

```
Exercises:
  GET    /exercises/                    List all
  POST   /exercises/                    Create
  GET    /exercises/{id}/               Retrieve
  PUT    /exercises/{id}/               Update
  DELETE /exercises/{id}/               Delete
  
  Query params:
    muscle_group={id}     Filter by muscle group
    exercise_type={id}    Filter by exercise type
    search={query}        Search by name

Sessions:
  GET    /sessions/                     List all
  POST   /sessions/                     Create
  GET    /sessions/{id}/                Retrieve
  PUT    /sessions/{id}/                Update
  DELETE /sessions/{id}/                Delete
  
  Query params:
    date_from={YYYY-MM-DD}     From date
    date_to={YYYY-MM-DD}       To date
    completed={true|false}     By status
    exercise_id={id}           Filter by exercise
    muscle_group_id={id}       Filter by muscle group

Session Entries:
  GET    /session-entries/              List all
  POST   /session-entries/              Add to session
  GET    /session-entries/{id}/         Retrieve
  PUT    /session-entries/{id}/         Update
  DELETE /session-entries/{id}/         Delete

Muscle Groups:
  GET    /muscle-groups/                List all
  GET    /muscle-groups/{id}/           Retrieve
```

## Running the Application

### Backend

```bash
# Activate virtual environment
source ../program_venv/bin/activate

# Run migrations (first time)
python manage.py migrate

# Start development server
python manage.py runserver

# Runs on http://localhost:8000
```

### Frontend

```bash
cd frontend

# Install dependencies (first time)
npm install

# Start development server
npm run dev

# Runs on http://localhost:5173
# Proxies /api requests to http://localhost:8000
```

### Import Data

```bash
# From project root
python manage.py import_sessions
```

## Technology Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Django | 5.2.9 | Web framework |
| Django REST Framework | 3.16.1 | REST API |
| Django Filter | Latest | Filtering support |
| Python | 3.11+ | Language |
| SQLite | - | Development DB |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | UI library |
| TypeScript | 5.2.2 | Type safety |
| Vite | 5.0.8 | Build tool |
| Tailwind CSS | 3.3.6 | Styling |
| TanStack Table | 8.11.3 | Data tables |
| date-fns | 3.0.0 | Date utilities |
| Lucide React | 0.294.0 | Icons |

## Development Workflow

### Adding a New Feature

1. **Backend**:
   - Add model or update existing in `base/models.py`
   - Create migration: `python manage.py makemigrations`
   - Run migration: `python manage.py migrate`
   - Add ViewSet in `api/views.py`
   - Add Serializers in `api/serialisers.py`
   - Register in `api/urls.py`

2. **Frontend**:
   - Fetch data using `api/client.ts` functions
   - Create/update components in `src/views/` or `src/components/`
   - Use Tailwind CSS for styling
   - Update `App.tsx` navigation if needed

### File Organization

- **Keep it co-located**: Related components, styles, and utilities in same folder
- **Separate concerns**: UI components in `components/`, views in `views/`
- **API layer**: All HTTP calls go through `api/client.ts`
- **Type safety**: Use TypeScript interfaces for all API responses

## Testing

### Backend
```bash
python manage.py test
```

### Frontend
```bash
cd frontend
npm run lint
```

## Building for Production

### Backend
Deploy to Cloud Run, Heroku, or any WSGI host.

### Frontend
```bash
cd frontend
npm run build
```

Output: `frontend/dist/` - Deploy this folder to Vercel, Netlify, or static hosting.

## Common Issues

### Port Conflicts
- Django uses 8000, Frontend uses 5173
- Change in respective config if needed

### API Calls Failing
- Ensure both backend and frontend are running
- Check browser console for detailed errors
- Verify CORS if deploying to different domains

### Database Empty
- Run `python manage.py import_sessions` to populate data

## Git Workflow

```bash
# Status check
git status

# Commit changes
git add .
git commit -m "descriptive message"

# Push to remote
git push origin main
```

Files to ignore (in `.gitignore`):
- `**/__pycache__/` - Python cache
- `**/*.pyc` - Compiled Python
- `frontend/node_modules/` - npm dependencies
- `.env` - Environment variables
- `db.sqlite3` - Local database

## Next Steps

- [ ] Implement authentication (JWT)
- [ ] Add form components for creating sessions/exercises
- [ ] Set up PostgreSQL for production
- [ ] Configure CORS properly
- [ ] Add unit tests
- [ ] Set up CI/CD pipeline
- [ ] Deploy to production
