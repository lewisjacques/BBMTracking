# Create model serialisers because the response object cannot natively handle complex data types
from rest_framework import serializers
from django.utils import timezone
from base.models import Session, SessionEntry, Exercise, MuscleGroup, ExerciseType

# ===== Basic Serializers (for nesting) =====

class ExerciseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseType
        fields = ['id', 'type_name']

class MuscleGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuscleGroup
        fields = ['id', 'muscle_group_name']

# ===== Read Serializers (GET requests) =====

class ExerciseDetailSerializer(serializers.ModelSerializer):
    """Detail serializer for reading exercises with nested relations"""
    muscle_group = MuscleGroupSerializer(read_only=True)
    exercise_type = ExerciseTypeSerializer(read_only=True)
    
    class Meta:
        model = Exercise
        fields = ['id', 'exercise_name', 'exercise_name_legacy', 'muscle_group', 'exercise_type']

class SessionEntryDetailSerializer(serializers.ModelSerializer):
    """Detail serializer for reading session entries with full exercise info"""
    exercise = ExerciseDetailSerializer(read_only=True)
    
    class Meta:
        model = SessionEntry
        fields = ['id', 'exercise', 'weight', 'status']

class SessionDetailSerializer(serializers.ModelSerializer):
    """Detail serializer for reading sessions with nested entries"""
    session_entries = SessionEntryDetailSerializer(
        source='sessionentry_set',
        many=True,
        read_only=True
    )
    
    class Meta:
        model = Session
        fields = ['id', 'date', 'notes', 'completed', 'session_entries']

# ===== Write Serializers (POST/PUT requests) =====

class ExerciseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating exercises - accepts IDs instead of nested objects"""
    
    class Meta:
        model = Exercise
        fields = ['exercise_name', 'exercise_name_legacy', 'muscle_group', 'exercise_type']
    
    def validate_muscle_group(self, value):
        """Ensure muscle_group is provided"""
        if not value:
            raise serializers.ValidationError("Muscle group is required")
        return value

class SessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating sessions"""
    
    class Meta:
        model = Session
        fields = ['date', 'notes', 'completed']
    
    def validate_date(self, value):
        """Validate that date is not in the future"""
        if value > timezone.now().date():
            raise serializers.ValidationError("Session date cannot be in the future")
        return value

class SessionEntryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating session entries"""
    
    class Meta:
        model = SessionEntry
        fields = ['session', 'exercise', 'weight', 'status']
    
    def validate(self, data):
        """Validate session entry data"""
        if not data.get('exercise'):
            raise serializers.ValidationError({'exercise': 'Exercise is required'})
        if not data.get('session'):
            raise serializers.ValidationError({'session': 'Session is required'})
        return data