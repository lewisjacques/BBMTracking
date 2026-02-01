# Fitness Program - Project Structure

## Overview

Full-stack fitness tracking application with Django REST Framework backend and React + TypeScript frontend. Features JWT authentication, multi-tenant schema-based data isolation, and responsive dark-themed UI.

## Directory Layout

```
program_viewer/
│
├── 📁 api/                              # Django REST Framework endpoints
│   ├── __init__.py
│   ├── views.py                         # ViewSets with UserSchemaViewSetMixin
│   ├── serialisers.py                   # Detail & Create serializers
│   └── urls.py                          # DRF router configuration
│
├── 📁 base/                             # Core Django app
│   ├── models.py                        # Exercise, Session, SessionEntry, MuscleGroup, ExerciseType
│   ├── serializers.py                   # Auth serializers (RegisterSerializer, CustomTokenObtainPairSerializer)
│   ├── views.py                         # Auth views (RegisterView, LoginView, UserDetailView, LogoutView)
│   ├── admin.py                         # Django admin config
│   ├── apps.py                          # App config with User.activate() method injection
│   ├── tests.py
│   ├── utils/
│   │   └── user_context.py              # Schema management utilities
│   ├── management/commands/
│   │   └── import_sessions.py           # CSV import command
│   └── migrations/                      # Database migrations
│
├── 📁 program_viewer/                   # Django project settings
│   ├── __init__.py
│   ├── settings.py                      # JWT, PostgreSQL, CORS config
│   ├── urls.py                          # Auth routes + API routes
│   ├── wsgi.py
│   └── asgi.py
│
├── 📁 frontend/                         # React + TypeScript + Vite
│   ├── 📁 src/
│   │   ├── 📁 api/
│   │   │   └── client.ts                # API client with auth functions
│   │   ├── 📁 components/
│   │   │   ├── SummaryCards.tsx         # Reusable summary card display
│   │   │   ├── ExercisesTable.tsx       # Exercise table component
│   │   │   ├── AddExerciseModal.tsx     # Add exercise modal
│   │   │   └── ui/
│   │   │       └── button.tsx           # Reusable button
│   │   ├── 📁 views/
│   │   │   ├── LoginPage.tsx            # Login/Register form
│   │   │   ├── DayView.tsx              # Day view with refactored components
│   │   │   ├── WeekView.tsx             # Week overview
│   │   │   └── MonthView.tsx            # Month overview
│   │   ├── App.tsx                      # Main app with auth/user menu
│   │   ├── main.tsx                     # Entry point
│   │   └── index.css                    # Tailwind directives
│   │
│   ├── 📁 node_modules/                 # npm dependencies
│   ├── index.html                       # HTML entry point
│   ├── package.json                     # Dependencies
│   ├── vite.config.ts                   # Port 5173, proxy to /api
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .gitignore
│
├── 📁 _legacy/                          # Historical data
│   ├── exercises.csv
│   └── session_data_lew.csv
│
├── manage.py                            # Django CLI
├── .gitignore
└── README.md
```

## Architecture Overview

### Backend Architecture

**Multi-Tenant Schema-Based Isolation**:
- Shared tables in `public` schema: auth_user, base_exercise, base_musclegroup, base_exercisetype
- User-specific tables in `user_{id}` schemas: base_session, base_sessionentry
- Mixin pattern (`UserSchemaViewSetMixin`) automatically sets PostgreSQL search_path for all requests

**Authentication Flow**:
1. User registers → User schema created (`CREATE SCHEMA user_{id}` with tables) via `create_user_schema()`
2. User logs in → JWT tokens issued (access + refresh) via `CustomTokenObtainPairSerializer`
3. Frontend stores tokens in localStorage
4. Each API request includes `Authorization: Bearer {token}`
5. ViewSets use `UserSchemaViewSetMixin` to:
   - Verify authentication via `permission_classes = [IsAuthenticated]`
   - Set `search_path` to user's schema via `dispatch()` method
   - Automatically filter data by user via `UserSchemaManager` ORM

**Schema Management** (`base/utils/user_context.py`):
- `create_user_schema(user_id)` - Creates PostgreSQL schema + tables for new user
- `UserSchemaManager` - ORM manager that sets search_path on queries
- `user_schema_context(user)` - Context manager for temporary schema switching
- `activate()` - Method added to User model for shell access

**Database**:
- PostgreSQL 15 (localhost:5432, training_program_db)
- Schema per user (data isolation)
- Shared reference tables (exercises, muscle groups)

### Frontend Architecture

**Authentication State**:
- User object stored in localStorage
- Tokens (access/refresh) stored in localStorage
- App.tsx checks for token on load
- Shows LoginPage if not authenticated, main app if authenticated

**User Settings**:
- Settings button in top-right header (all pages)
- Dropdown shows: user name, email, logout button
- Logout clears tokens and resets user state

## API Endpoints

### Authentication Routes (`/api/auth/`)

```
POST   /auth/register/         # Register new user (creates schema)
POST   /auth/login/            # Login (returns access + refresh tokens)
POST   /auth/refresh/          # Refresh access token
GET    /auth/me/               # Get current user details
POST   /auth/logout/           # Logout (clear tokens)
```

### API Routes (`/api/`) - Requires Authentication

```
Exercises (shared, no auth required):
  GET    /exercises/           List all
  POST   /exercises/           Create
  GET    /exercises/{id}/      Retrieve
  PUT    /exercises/{id}/      Update
  DELETE /exercises/{id}/      Delete

Sessions (user-specific, decorated):
  GET    /sessions/            List user's sessions
  POST   /sessions/            Create session
  GET    /sessions/{id}/       Retrieve
  PUT    /sessions/{id}/       Update
  DELETE /sessions/{id}/       Delete

Session Entries (user-specific):
  GET    /session-entries/     List user's entries
  POST   /session-entries/     Add to session
  GET    /session-entries/{id}/
  PUT    /session-entries/{id}/
  DELETE /session-entries/{id}/

Muscle Groups (shared):
  GET    /muscle-groups/       List all
  GET    /muscle-groups/{id}/  Retrieve
```

## Key Features

### Authentication & Security
- ✅ JWT token-based authentication
- ✅ Access tokens (1-hour expiry) + Refresh tokens (7-day expiry)
- ✅ Email-based login (not username)
- ✅ Automatic schema creation per user
- ✅ Row-level data isolation via PostgreSQL schemas

### Multi-Tenancy
- ✅ `@auto_user_context` decorator on ViewSet methods
- ✅ Automatic schema switching per request
- ✅ Shared reference tables (exercises, muscle groups)
- ✅ User schema created on registration
- ✅ Indexes for performance

### Frontend UI
- ✅ Professional dark theme (slate/gray/blue colors)
- ✅ Login page with register tab switching
- ✅ User settings dropdown (top-right)
- ✅ Logout functionality
- ✅ Responsive components
- ✅ Day/Week/Month views

### Backend
- ✅ Split serializers (Detail/Create versions)
- ✅ Advanced filtering (date range, muscle group, exercise)
- ✅ Duplicate exercise detection
- ✅ Proper error handling

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Backend | Django | 5.2.9 | Web framework |
| | Django REST Framework | 3.16.1 | REST API |
| | djangorestframework-simplejwt | Latest | JWT auth |
| | PostgreSQL | 15 | Database |
| | psycopg2-binary | Latest | PostgreSQL driver |
| | Python | 3.11+ | Language |
| Frontend | React | 18.2 | UI framework |
| | TypeScript | 5.2 | Type safety |
| | Vite | 5.0 | Build tool |
| | Tailwind CSS | 3.3 | Styling |
| | date-fns | 3.0 | Date utilities |
| | Lucide React | Latest | Icons |

## Running the Application

### Backend

```bash
# Activate environment
source ../program_venv/bin/activate

# Run migrations
python manage.py migrate

# Start server (port 8000)
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install  # first time only
npm run dev  # starts on port 5173
```

### Database Setup

```bash
# Create PostgreSQL database
createdb training_program_db

# Run migrations to create tables
python manage.py migrate
```

## Development Workflow

### Adding Features

1. **Backend**:
   - Update models in `base/models.py`
   - Create migration: `python manage.py makemigrations`
   - Add ViewSet in `api/views.py` with `@auto_user_context`
   - Register in `api/urls.py`

2. **Frontend**:
   - Add API functions to `src/api/client.ts`
   - Create components in `src/components/` or `src/views/`
   - Use tokens from localStorage
   - All requests include `Authorization: Bearer {token}`

### Testing Auth

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","password2":"pass123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Use token
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/sessions/
```

## Deployment Checklist

- [ ] Set `DEBUG = False` in settings.py
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set strong `SECRET_KEY`
- [ ] Update JWT token expiry if needed
- [ ] Configure production PostgreSQL
- [ ] Build frontend: `npm run build`
- [ ] Deploy backend to Cloud Run/Heroku
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Set CORS allowed origins
- [ ] Enable HTTPS/SSL
- [ ] Configure domain in settings

## Future Enhancements

- [ ] Implement token refresh on 401
- [ ] Add user profile/settings page
- [ ] Export workout data as CSV/PDF
- [ ] Social login (Google, GitHub, Strava)
- [ ] Mobile app (React Native)
- [ ] Real-time updates (WebSockets)
- [ ] Analytics dashboard

Files to ignore (in `.gitignore`):
- `**/__pycache__/` - Python cache
- `**/*.pyc` - Compiled Python
- `frontend/node_modules/` - npm dependencies

## Next Steps

- [ ] Implement authentication (JWT)
- [ ] Add form components for creating exercises
- [ ] Set up PostgreSQL for production
- [ ] Configure CORS properly
- [ ] Add unit tests
- [ ] Set up CI/CD pipeline
- [ ] Deploy to production
