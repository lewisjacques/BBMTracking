from django.db import connection, models
from contextlib import contextmanager

class UserSchemaManager(models.Manager):
    """
    Custom manager that ensures queries use the current user's schema.
    Set via thread-local storage in the activate() function.
    """

    def get_queryset(self):
        qs = super().get_queryset()
        # Get current user from thread-local storage (set by activate())
        current_user_id = getattr(connection, '_current_user_id', None)
        if current_user_id:
            schema_name = f"user_{current_user_id}"
            with connection.cursor() as cursor:
                cursor.execute(f"SET search_path TO {schema_name}, public;")
        return qs
    
def create_user_schema(user_id: int) -> None:
    """Create PostgreSQL schema for new user with all tables"""

    schema_name = f"user_{user_id}"
    with connection.cursor() as cursor:
        # Create schema
        cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {schema_name};")
        
        # Create Session table in user schema
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {schema_name}.base_session (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                notes TEXT DEFAULT '',
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE INDEX {schema_name}_session_date_idx ON {schema_name}.base_session(date);
            CREATE INDEX {schema_name}_session_user_idx ON {schema_name}.base_session(user_id);
        """)
        
        # Create SessionEntry table in user schema
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {schema_name}.base_sessionentry (
                id SERIAL PRIMARY KEY,
                session_id INTEGER NOT NULL REFERENCES {schema_name}.base_session(id) ON DELETE CASCADE,
                exercise_id INTEGER NOT NULL REFERENCES public.base_exercise(id) ON DELETE CASCADE,
                weight VARCHAR(50) NOT NULL,
                status VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE INDEX {schema_name}_sessionentry_session_idx ON {schema_name}.base_sessionentry(session_id);
            CREATE INDEX {schema_name}_sessionentry_exercise_idx ON {schema_name}.base_sessionentry(exercise_id);
        """)

@contextmanager
def user_schema_context(user):
    """
    Context manager that sets the PostgreSQL schema context for a user.
    Automatically resets to public schema on exit.

    Args:
        user: Django User instance
    """
    schema_name = f"user_{user.id}"
    
    # Set schema
    with connection.cursor() as cursor:
        cursor.execute(f"SET search_path TO {schema_name}, public;")
    
    # Store user ID on connection for the custom manager
    connection._current_user_id = user.id
    
    try:
        yield
    finally:
        # Reset to public schema
        with connection.cursor() as cursor:
            cursor.execute("SET search_path TO public;")
        connection._current_user_id = None

def activate(self):
    """
    Activate this user's PostgreSQL schema context.
    Sets the flag that UserSchemaManager checks to route queries to the user's schema.
    
    Returns:
        self (for method chaining)
    """
    # Store user ID on connection for UserSchemaManager to use
    connection._current_user_id = self.id
    
    # Close the connection so next query gets a fresh connection
    # UserSchemaManager will set the search_path on the new connection
    connection.close()
    
    print(f"✓ Activated schema: user_{self.id} for user {self.email}")
    return self

