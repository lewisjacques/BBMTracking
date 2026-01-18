from rest_framework import viewsets, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from base.models import Session, Exercise, SessionEntry, MuscleGroup
from .serialisers import (
    SessionDetailSerializer, SessionCreateSerializer,
    ExerciseDetailSerializer, ExerciseCreateSerializer,
    SessionEntryDetailSerializer, SessionEntryCreateSerializer,
    MuscleGroupSerializer
)

class ExerciseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Exercise CRUD operations
    GET    /api/exercises/          - List all exercises
    POST   /api/exercises/          - Create new exercise
    GET    /api/exercises/{id}/     - Retrieve specific exercise
    PUT    /api/exercises/{id}/     - Update exercise
    DELETE /api/exercises/{id}/     - Delete exercise
    """
    queryset = Exercise.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['muscle_group', 'exercise_type']
    search_fields = ['exercise_name']
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action in ['create', 'update', 'partial_update']:
            return ExerciseCreateSerializer
        return ExerciseDetailSerializer
    
    def create(self, request, *args, **kwargs):
        """Create and return full exercise details"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            ExerciseDetailSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED
        )

class SessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Session CRUD operations with advanced filtering
    GET    /api/sessions/          - List with filters (date_from, date_to, completed, etc.)
    POST   /api/sessions/          - Create new session
    GET    /api/sessions/{id}/     - Retrieve specific session with entries
    PUT    /api/sessions/{id}/     - Update session
    DELETE /api/sessions/{id}/     - Delete session
    """
    # Prefetch related saves queries when accessing SessionEntry within Session
    queryset = Session.objects.all().prefetch_related('sessionentry_set')
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['completed']
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action in ['create', 'update', 'partial_update']:
            return SessionCreateSerializer
        return SessionDetailSerializer
    
    def get_queryset(self):
        """Apply custom filtering from query parameters"""
        # Using super() allows us to get a fresh queryset each time
        queryset = super().get_queryset()
        
        # Filter by date
        if date_from := self.request.query_params.get('date_from'):
            queryset = queryset.filter(date__gte=date_from)
        if date_to := self.request.query_params.get('date_to'):
            queryset = queryset.filter(date__lte=date_to)
        # Filter by exercise
        if exercise_id := self.request.query_params.get('exercise_id'):
            queryset = queryset.filter(sessionentry__exercise_id=exercise_id).distinct()
        # Filter by muscle group
        if muscle_group_id := self.request.query_params.get('muscle_group_id'):
            queryset = queryset.filter(
                sessionentry__exercise__muscle_group_id=muscle_group_id
            ).distinct()
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Create and return full session details"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            SessionDetailSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED
        )

class SessionEntryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for SessionEntry CRUD operations
    GET    /api/session-entries/          - List all entries
    POST   /api/session-entries/          - Create new entry
    GET    /api/session-entries/{id}/     - Retrieve specific entry
    PUT    /api/session-entries/{id}/     - Update entry
    DELETE /api/session-entries/{id}/     - Delete entry
    """
    queryset = SessionEntry.objects.all().select_related('session', 'exercise')
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['session', 'exercise']
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action in ['create', 'update', 'partial_update']:
            return SessionEntryCreateSerializer
        return SessionEntryDetailSerializer
    
    def create(self, request, *args, **kwargs):
        """Check for duplicate exercises in session before creating"""
        session_id = request.data.get('session')
        exercise_id = request.data.get('exercise')
        
        if SessionEntry.objects.filter(
            session_id=session_id,
            exercise_id=exercise_id
        ).exists():
            return Response(
                {'error': 'This exercise is already added to the session'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            SessionEntryDetailSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED
        )

class MuscleGroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for MuscleGroup read operations
    GET    /api/muscle-groups/          - List all muscle groups with exercises
    GET    /api/muscle-groups/{id}/     - Retrieve specific muscle group with exercises
    """
    queryset = MuscleGroup.objects.all().prefetch_related('exercise_set')
    serializer_class = MuscleGroupSerializer
