# Fitness Program 2.0

Professional full-stack fitness tracking application with JWT authentication, multi-tenant data isolation, and responsive React frontend.

## Quick Start

### Prerequisites
- Python 3.11+ with virtual environment
- Node.js 18+
- PostgreSQL 15 (training_program_db database)

### Backend Setup

```bash
# Activate virtual environment
source ../program_venv/bin/activate

# Run migrations
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

## Architecture

### Multi-Tenant Data Isolation
- **Shared tables** (public schema): auth_user, base_exercise, base_musclegroup, base_exercisetype
- **User-specific tables** (user_{id} schemas): base_session, base_sessionentry
- **Automatic schema switching** via `UserSchemaViewSetMixin` - sets PostgreSQL search_path on all requests

### Schema Management Architecture
The `base/utils/user_context.py` module provides:
- **`create_user_schema(user_id)`**: Creates PostgreSQL schema + tables on registration
- **`UserSchemaManager`**: Custom ORM manager ensuring queries use correct schema
- **`user_schema_context(user)`**: Context manager for temporary schema switching
- **`activate()`**: Method on User model for Django shell access to user's schema

### Authentication Flow
1. User registers → `create_user_schema()` creates user_{id} schema with tables
2. JWT tokens issued (1h access, 7d refresh) via CustomTokenObtainPairSerializer
3. Frontend stores tokens in localStorage
4. Each request includes `Authorization: Bearer {token}`
5. `UserSchemaViewSetMixin` automatically sets database schema context via dispatch()

## Features

### Backend
- ✅ JWT token-based authentication (email-based login)
- ✅ Schema-per-user multi-tenancy
- ✅ Automatic schema creation on registration
- ✅ Advanced filtering (date range, muscle group, exercise)
- ✅ Split serializers (Detail/Create versions)
- ✅ Duplicate exercise detection in sessions

### Frontend
- ✅ Professional dark theme UI
- ✅ Login page with register tab
- ✅ User settings dropdown (top-right, all pages)
- ✅ Day/Week/Month view toggles
- ✅ Responsive refactored components
- ✅ Token-based request authentication
- ✅ TypeScript type safety

## API Quick Reference

### Authentication (`/api/auth/`)
```
POST   /auth/register/         Register (creates user schema)
POST   /auth/login/            Login (returns tokens)
POST   /auth/refresh/          Refresh access token
GET    /auth/me/               Get current user
POST   /auth/logout/           Logout
```

### Fitness Data (`/api/`)
```
Sessions:     GET/POST /sessions/, GET/PUT/DELETE /sessions/{id}/
Entries:      GET/POST /session-entries/, GET/PUT/DELETE /session-entries/{id}/
Exercises:    GET/POST /exercises/, GET/PUT/DELETE /exercises/{id}/
Muscle Groups: GET /muscle-groups/, GET /muscle-groups/{id}/
```

**See PROJECT_STRUCTURE.md for complete endpoint documentation.**

## Technology Stack

| Backend | Frontend |
|---------|----------|
| Django 5.2.9 | React 18.2 |
| Django REST Framework 3.16 | TypeScript 5.2 |
| djangorestframework-simplejwt | Vite 5.0 |
| PostgreSQL 15 | Tailwind CSS 3.3 |
| psycopg2 | date-fns 3.0 |
| Python 3.11+ | Lucide React |

## Documentation

### Complete Reference
**PROJECT_STRUCTURE.md** contains:
- Complete directory layout with descriptions
- Detailed architecture explanation
- Full API endpoint reference with query parameters
- Development workflow and guidelines
- Deployment checklist

### This README covers:
- Quick start (backend & frontend setup)
- Architecture overview
- Feature list
- Common tasks and troubleshooting

## Common Tasks

### Import Historical Data
```bash
python manage.py import_sessions
```

### Run Tests
```bash
# Backend
python manage.py test

# Frontend
cd frontend
npm run lint
```

### Build for Production
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

## Troubleshooting

### Port Conflicts
- Backend: 8000
- Frontend: 5173

### API Calls Failing
1. Ensure both servers are running
2. Check browser console for errors
3. Verify tokens in localStorage: `window.localStorage`
4. Check Django logs for 401/403 errors

### Database Issues
- Connect: `psql -U ljw -d training_program_db`
- List schemas: `\dn`
- Check user tables: `SELECT * FROM <user>.base_session;`