import csv
# Django's base class for handling command line commands like migrate
from django.core.management.base import BaseCommand
# Database transaction wrapper for atomic transactions
from django.db import transaction
from base.models import Session, SessionEntry, Exercise, MuscleGroup, ExerciseType
from base.utils.legacy_data_handling import combine_exercises
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
        parser.add_argument(
            '--clear-db',
            action='store_true',
            help='Clear all sessions and entries before importing'
        )

    def handle(self, *args, **options):
        email = options['email']
        clear_db = options.get('clear_db', False)
        
        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User with email {email} not found')
            )
            return
        
        # Clear database if requested (only for this user)
        if clear_db:
            self.stdout.write(
                self.style.WARNING(f'Clearing all sessions and entries for {user.email}...')
            )
            sessions_to_delete = Session.objects.filter(user=user)
            SessionEntry.objects.filter(session__user=user).delete()
            sessions_to_delete.delete()
            self.stdout.write(
                self.style.SUCCESS(f'Database cleared for {user.email}.')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Importing sessions for user: {user.email}')
        )
        
        # Load session and exercise data
        session_data = pd.read_csv(f'_legacy/{email.split("@")[0]}/session_data.csv')
        exercise_data = pd.read_csv('_legacy/exercises.csv')
        
        # Combine and normalize the data
        combined_data = combine_exercises(session_data, exercise_data, save_dir=None)
        
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
                exercise_obj, created = Exercise.objects.get_or_create(
                    exercise_name=exercise_name,
                    defaults={
                        'exercise_name_legacy': exercise_name,
                        'muscle_group': muscle_group_obj,
                        'exercise_type': exercise_type_obj
                    }
                )
                
                # If exercise already existed and is missing exercise_type, update it
                if not created and not exercise_obj.exercise_type and exercise_type_obj:
                    exercise_obj.exercise_type = exercise_type_obj
                    exercise_obj.save()

                # Get or create session for this date and user
                # Multiple entries can belong to the same date/session
                session, created = Session.objects.get_or_create(
                    date=datetime.strptime(row['Date'], '%Y-%m-%d').date(),
                    user=user,
                    defaults={'notes': '', 'completed': True}
                )
                if created:
                    sessions_created += 1
                
                # Create session entry only if it doesn't already exist
                entry_exists = SessionEntry.objects.filter(
                    session=session,
                    exercise=exercise_obj,
                    weight=str(row['Weight']),
                    status=row['Status']
                ).exists()
                
                if not entry_exists:
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