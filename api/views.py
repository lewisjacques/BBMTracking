from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from django.db import connection

from base.models import Session, Exercise, SessionEntry, MuscleGroup
from .serialisers import (
    SessionDetailSerializer, SessionCreateSerializer,
    ExerciseDetailSerializer, ExerciseCreateSerializer,
    SessionEntryDetailSerializer, SessionEntryCreateSerializer,
    MuscleGroupSerializer
)


class UserSchemaViewSetMixin:
    """
    Mixin that sets PostgreSQL schema context for authenticated user.
    Automatically routes queries to the user's schema.
    """
    def dispatch(self, request, *args, **kwargs):
        # Set schema context if user is authenticated
        if request.user and request.user.is_authenticated:
            schema_name = f"user_{request.user.id}"
            with connection.cursor() as cursor:
                cursor.execute(f"SET search_path TO {schema_name}, public;")
        return super().dispatch(request, *args, **kwargs)

class ExerciseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Exercise CRUD operations
    GET    /api/exercises/          - List all exercises : list()
    POST   /api/exercises/          - Create new exercise : create()
    GET    /api/exercises/{id}/     - Retrieve specific exercise : retrieve()
    PUT    /api/exercises/{id}/     - Update exercise : update()
    DELETE /api/exercises/{id}/     - Delete exercise : destroy()
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

class SessionViewSet(UserSchemaViewSetMixin, viewsets.ModelViewSet):
    """
    ViewSet for Session CRUD operations with user schema context
    GET    /api/sessions/          - List sessions for user (schema-filtered)
    POST   /api/sessions/          - Create new session for user
    GET    /api/sessions/{id}/     - Retrieve specific session
    PUT    /api/sessions/{id}/     - Update session
    DELETE /api/sessions/{id}/     - Delete session
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['completed']
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action in ['create', 'update', 'partial_update']:
            return SessionCreateSerializer
        return SessionDetailSerializer
    
    def list(self, request):
        """List all sessions for authenticated user (schema-filtered)"""
        queryset = Session.objects.filter(user=request.user).prefetch_related('sessionentry_set')
        
        # Apply custom filtering
        if date_from := request.query_params.get('date_from'):
            queryset = queryset.filter(date__gte=date_from)
        if date_to := request.query_params.get('date_to'):
            queryset = queryset.filter(date__lte=date_to)
        if exercise_id := request.query_params.get('exercise_id'):
            queryset = queryset.filter(sessionentry__exercise_id=exercise_id).distinct()
        if muscle_group_id := request.query_params.get('muscle_group_id'):
            queryset = queryset.filter(
                sessionentry__exercise__muscle_group_id=muscle_group_id
            ).distinct()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        """Create new session for authenticated user"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(
            SessionDetailSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED
        )
    
    def retrieve(self, request, pk=None):
        """Retrieve specific session for authenticated user"""
        try:
            session = Session.objects.get(id=pk, user=request.user)
        except Session.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(session)
        return Response(serializer.data)
    
    def update(self, request, pk=None):
        """Update session for authenticated user"""
        try:
            session = Session.objects.get(id=pk, user=request.user)
        except Session.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(session, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(SessionDetailSerializer(serializer.instance).data)
    
    def destroy(self, request, pk=None):
        """Delete session for authenticated user"""
        try:
            session = Session.objects.get(id=pk, user=request.user)
        except Session.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SessionEntryViewSet(UserSchemaViewSetMixin, viewsets.ModelViewSet):
    """
    ViewSet for SessionEntry CRUD operations
    GET    /api/session-entries/          - List user's entries
    POST   /api/session-entries/          - Create new entry (in user's session)
    GET    /api/session-entries/{id}/     - Retrieve specific entry
    PUT    /api/session-entries/{id}/     - Update entry
    DELETE /api/session-entries/{id}/     - Delete entry
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['session', 'exercise']
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action in ['create', 'update', 'partial_update']:
            return SessionEntryCreateSerializer
        return SessionEntryDetailSerializer
    
    def list(self, request):
        """List session entries only for sessions belonging to user"""
        queryset = SessionEntry.objects.filter(
            session__user=request.user
        ).select_related('exercise', 'session')
        
        # Apply session filtering if provided
        if session_id := request.query_params.get('session'):
            queryset = queryset.filter(session_id=session_id)
        
        # Apply exercise filtering if provided
        if exercise_id := request.query_params.get('exercise'):
            queryset = queryset.filter(exercise_id=exercise_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        """Create new session entry (must belong to user's session, check for duplicates)"""
        session_id = request.data.get('session')
        exercise_id = request.data.get('exercise')
        
        # Verify session belongs to user
        try:
            session = Session.objects.get(id=session_id, user=request.user)
        except Session.DoesNotExist:
            return Response(
                {'detail': 'Session not found or does not belong to user'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check for duplicate exercises
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
        serializer.save()
        return Response(
            SessionEntryDetailSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED
        )
        
    def retrieve(self, request, pk=None):
        """Retrieve specific session entry (must belong to user's session)"""
        try:
            entry = SessionEntry.objects.get(id=pk, session__user=request.user)
        except SessionEntry.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(entry)
        return Response(serializer.data)
    
    def update(self, request, pk=None):
        """Update session entry (must belong to user's session)"""
        try:
            entry = SessionEntry.objects.get(id=pk, session__user=request.user)
        except SessionEntry.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(entry, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    def destroy(self, request, pk=None):
        """Delete session entry (must belong to user's session)"""
        try:
            entry = SessionEntry.objects.get(id=pk, session__user=request.user)
        except SessionEntry.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MuscleGroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for MuscleGroup read operations
    GET    /api/muscle-groups/          - List all muscle groups with exercises
    GET    /api/muscle-groups/{id}/     - Retrieve specific muscle group with exercises
    """
    queryset = MuscleGroup.objects.all().prefetch_related('exercise_set')
    serializer_class = MuscleGroupSerializer
