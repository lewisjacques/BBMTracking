import csv
# Django's base class for handling command line commands like migrate
from django.core.management.base import BaseCommand
# Database transaction wrapper for atomic transactions
from django.db import transaction
from base.models import Session, SessionEntry, Exercise, MuscleGroup, ExerciseType
from base.utils.legacy_data_handling import combine_exercises
from base.utils.user_context import user_schema_context
from django.contrib.auth.models import User
from datetime import datetime
import pandas as pd

# Must be named Command for Django to recognize it
class Command(BaseCommand):
    """
    Import sessions from CSV file and assign them to a specific user
    """
    help = 'Import sessions from CSV file for a specific user (by email)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            required=True,
            help='Email of user to assign sessions to'
        )

    def handle(self, *args, **options):
        email = options['email']
        
        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User with email {email} not found')
            )
            return
        
        self.stdout.write(
            self.style.SUCCESS(f'Importing sessions for user: {user.email}')
        )
        
        # Load session and exercise data
        session_data = pd.read_csv(f'_legacy/{email.split("@")[0]}/session_data.csv')
        exercise_data = pd.read_csv('_legacy/exercises.csv')
        
        # Combine and normalize the data
        combined_data = combine_exercises(session_data, exercise_data, save_dir=None)
        
        # Set user schema context and import within that context
        with user_schema_context(user):
            # Use transaction to rollback everything if there's an error
            with transaction.atomic():
                sessions_created = 0
                entries_created = 0
                
                # Iterate through combined data
                for _, row in combined_data.iterrows():
                    exercise_name = row['Exercise']
                    muscle_group_name = row['MuscleGroup'] if pd.notna(row['MuscleGroup']) else ''
                    exercise_type_name = row['exercise_type'] if pd.notna(row['exercise_type']) else ''
                    
                    # Get or create the MuscleGroup object
                    muscle_group_obj, _ = MuscleGroup.objects.get_or_create(
                        muscle_group_name=muscle_group_name
                    )
                    
                    # Get or create the ExerciseType object
                    exercise_type_obj = None
                    if exercise_type_name:
                        exercise_type_obj, _ = ExerciseType.objects.get_or_create(
                            type_name=exercise_type_name
                        )
                    
                    # Get or create exercise
                    exercise_obj, _ = Exercise.objects.get_or_create(
                        exercise_name=exercise_name,
                        defaults={
                            'exercise_name_legacy': exercise_name,
                            'muscle_group': muscle_group_obj,
                            'exercise_type': exercise_type_obj
                        }
                    )

                    # Get or create session for this date and user
                    # Multiple entries can belong to the same date/session
                    session, created = Session.objects.get_or_create(
                        date=datetime.strptime(row['Date'], '%Y-%m-%d').date(),
                        user=user,
                        defaults={'notes': '', 'completed': True}
                    )
                    if created:
                        sessions_created += 1
                    
                    # Create session entry
                    SessionEntry.objects.create(
                        session=session,
                        exercise=exercise_obj,
                        weight=str(row['Weight']),
                        status=row['Status']
                    )
                    entries_created += 1
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully imported {sessions_created} sessions and {entries_created} entries for {user.email}'
                    )
                )