# Create model serialisers because the response object cannot natively handle complex data types
from rest_framework import serializers
from base.models import Session, SessionEntry, Exercise, MuscleGroup, ExerciseType

class MuscleGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuscleGroup
        fields = ['id', 'muscle_group_name']

class ExerciseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseType
        fields = ['id', 'type_name']

class ExerciseSerializer(serializers.ModelSerializer):
    muscle_group = MuscleGroupSerializer(read_only=True)
    exercise_type = ExerciseTypeSerializer(read_only=True)
    class Meta:
        # Two required attributes, the model, and the attributes we want to serialize
        model = Exercise
        # Fields to serialize
        fields = "__all__"

class MuscleGroupWithExercisesSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(
        many=True, 
        read_only=True, 
        source='exercise_set'
    )
    class Meta:
        model = MuscleGroup
        fields = ['id', 'muscle_group_name', 'exercises']

class SessionEntrySerializer(serializers.ModelSerializer):
    # This tells Django to use the ExerciseSerializer to represent the exercise field
    exercise = ExerciseSerializer(read_only=True)  # Nested serializer
    class Meta:
        model = SessionEntry
        fields = "__all__"

class SessionSerializer(serializers.ModelSerializer):
    # Define the reverse relationship - 'sessionentry_set' is Django's auto-generated name
    session_entries = SessionEntrySerializer(
        source='sessionentry_set', 
        many=True,
        # Indicates we don't need to provide this data when creating/updating a Session
        read_only=True
    )
    class Meta:
        # Two required attributes, the model, and the attributes we want to serialize
        model = Session
        # Explicitly list fields since we're adding a custom one
        fields = ['id', 'date', 'notes', 'completed', 'session_entries']