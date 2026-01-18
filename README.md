# Fitness Program 2.0

A full-stack fitness tracking application with Django REST Framework backend and React frontend.

## Project Structure

```
program_viewer/
├── backend/              # Django REST API
│   ├── api/              # REST API endpoints (ViewSets)
│   ├── base/             # Core models (Exercise, Session, SessionEntry, MuscleGroup, ExerciseType)
│   ├── program_viewer/   # Django settings & WSGI
│   ├── manage.py         # Django management
│   └── db.sqlite3        # Development database
│
├── frontend/             # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # Reusable UI components (Button, Table)
│   │   ├── views/        # Page components (DayView, WeekView)
│   │   ├── api/          # TypeScript API client
│   │   ├── App.tsx       # Main component
│   │   └── main.tsx      # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md
```

## Quick Start

### Backend Setup

```bash
# Activate virtual environment
source ../program_venv/bin/activate

# Run migrations (if needed)
python manage.py migrate

# Start development server
python manage.py runserver
```

Backend runs on: `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`
API requests are proxied to `http://localhost:8000`

## Features

### Backend (Django REST Framework)
- **Models:** Exercise, Session, SessionEntry, MuscleGroup, ExerciseType
- **ViewSets:** 4 RESTful endpoints with filtering and search
- **Serializers:** Separate Detail (read) and Create (write) versions
- **Filtering:** By date range, muscle group, exercise type, completion status

### Frontend (React + TypeScript)
- **Day View:** Detailed exercise table for a selected day with stats
- **Week View:** Week overview with daily stats and muscle group distribution
- **Navigation:** Date picker with previous/next controls
- **Responsive:** Mobile and desktop layouts using Tailwind CSS

## API Endpoints

All endpoints at `http://localhost:8000`:

```
GET    /exercises/                    # List exercises
POST   /exercises/                    # Create exercise
GET    /exercises/{id}/               # Get exercise
PUT    /exercises/{id}/               # Update exercise
DELETE /exercises/{id}/               # Delete exercise

GET    /sessions/                     # List sessions (with filters)
POST   /sessions/                     # Create session
GET    /sessions/{id}/                # Get session
PUT    /sessions/{id}/                # Update session
DELETE /sessions/{id}/                # Delete session

GET    /session-entries/              # List entries
POST   /session-entries/              # Add entry to session
GET    /session-entries/{id}/         # Get entry
PUT    /session-entries/{id}/         # Update entry
DELETE /session-entries/{id}/         # Delete entry

GET    /muscle-groups/                # List muscle groups
GET    /muscle-groups/{id}/           # Get muscle group
```

### Query Parameters

**Sessions:**
- `date_from=YYYY-MM-DD` - Filter from date
- `date_to=YYYY-MM-DD` - Filter to date
- `muscle_group_id=1` - Filter by muscle group
- `exercise_id=1` - Filter by exercise
- `completed=true` - Filter by completion status

**Exercises:**
- `muscle_group=1` - Filter by muscle group
- `exercise_type=1` - Filter by exercise type
- `search=query` - Search by name

## Technology Stack

### Backend
- Django 5.2.9
- Django REST Framework 3.16.1
- SQLite (development) / PostgreSQL (production)
- Python 3.11+

### Frontend
- React 18.2
- TypeScript 5.2
- Vite 5.0
- Tailwind CSS 3.3
- TanStack Table v8
- date-fns 3.0
- Lucide React icons

## Development

### Install Dependencies

Backend:
```bash
source ../program_venv/bin/activate
pip install -r requirements.txt  # if exists
```

Frontend:
```bash
cd frontend
npm install
```

### Run Tests

Backend:
```bash
python manage.py test
```

Frontend:
```bash
cd frontend
npm run lint
```

### Build for Production

Frontend:
```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

## Environment Variables

### Backend
Configure in `program_viewer/settings.py`:
- `DEBUG = False` for production
- `ALLOWED_HOSTS = [...]` for deployment
- `DATABASES` for PostgreSQL

### Frontend
Create `frontend/.env`:
```
VITE_API_URL=http://your-backend-url
```

## Deployment

### Backend
Deploy to Cloud Run, Heroku, or any Python host with Django support.

### Frontend
Deploy `frontend/dist/` to:
- Vercel
- Netlify
- GitHub Pages
- Cloud Storage (GCS)

## Troubleshooting

### API calls failing
1. Ensure Django backend is running on `http://localhost:8000`
2. Check CORS configuration if needed
3. Verify database has data (run import_sessions.py if empty)

### Styles not showing
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Port conflicts
- Django: Change `runserver` port
- Frontend: Edit `frontend/vite.config.ts` port

## Data Import

Import historical workout data:
```bash
python manage.py import_sessions
```

This command:
- Reads CSV files from `_legacy/` folder
- Creates exercises, muscle groups, and exercise types
- Populates sessions and session entries

## Next Steps

- [ ] Add CORS configuration for production
- [ ] Set up PostgreSQL database
- [ ] Implement authentication (JWT)
- [ ] Add edit/delete UI functionality
- [ ] Create session/entry forms
- [ ] Set up CI/CD pipeline
- [ ] Deploy to production