# Respnse will take python data or serialised data and render it into JSON 
from rest_framework.response import Response
from rest_framework.decorators import api_view
from base.models import Session, Exercise, SessionEntry, MuscleGroup
from .serialisers import SessionSerializer, ExerciseSerializer, SessionEntrySerializer, MuscleGroupSerializer, MuscleGroupWithExercisesSerializer

### --- Total Views --- ###

@api_view(['GET'])
def getSessions(request, filters:None|dict=None):
    """
    Get all sessions for the user.
    Example usage - "GET /sessions/?date_from=2025-01-01&completed=true"

    Filtering functionality for:
        - Time period
        - Completion status
        - Exercise
        - Muscle Group
    """
    filters = {}
    
    # Extract query parameters from request
    if request.query_params.get('date_from'):
        filters['date__gte'] = request.query_params.get('date_from')
    if request.query_params.get('date_to'):
        filters['date__lte'] = request.query_params.get('date_to')
    if request.query_params.get('completed'):
        filters['completed'] = request.query_params.get('completed') == 'true'
    # For filtering by exercise (via SessionEntry)
    if request.query_params.get('exercise_id'):
        filters['sessionentry__exercise_id'] = request.query_params.get('exercise_id')
    # For filtering by muscle group (via SessionEntry -> Exercise -> MuscleGroup)
    if request.query_params.get('muscle_group_id'):
        filters['sessionentry__exercise__muscle_group_id'] = request.query_params.get('muscle_group_id')
    
    sessions = Session.objects.filter(**filters).distinct() if filters else Session.objects.all()
    serializer = SessionSerializer(sessions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getExercises(request):
    filters = {}
    if request.query_params.get('muscle_group_id'):
        filters['muscle_group_id'] = request.query_params.get('muscle_group_id')

    exercises = Exercise.objects.filter(**filters) if filters else Exercise.objects.all()
    serializer = ExerciseSerializer(exercises, many=True)
    return Response(serializer.data)

# Get Muscle Groups with all relevant exercises nested within
@api_view(['GET'])
def getMuscleGroups(request):
    muscle_groups = MuscleGroup.objects.all()
    serializer = MuscleGroupWithExercisesSerializer(muscle_groups, many=True)
    return Response(serializer.data)

### --- Individual Views --- ###

@api_view(['GET'])
# Return the session information with all session entries nested within it
def getSession(request, pk):
    try:
        session = Session.objects.get(id=pk)
        # SessionSerializer now automatically includes nested session_entries with exercise details
        serializer = SessionSerializer(session)
        return Response(serializer.data)
    except Session.DoesNotExist:
        return Response({'error': f'Session {pk} not found'}, status=404)

### --- Post Requests --- ###

@api_view(['POST'])
def addExercise(request):
    # Let the serializer do the heavy lifting by passing the whole request through
    serializer = ExerciseSerializer(data=request.data)
    if serializer.is_valid():
        # Create a new item in the database
        serializer.save()
        # Return the newly created exercise in the response
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
def addSession(request):
    serializer = SessionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
def addSessionEntry(request):
    # Don't allow the same exercise twice in one session
    session_id = request.data.get('session')
    exercise_id = request.data.get('exercise')

    if SessionEntry.objects.filter(session_id=session_id, exercise_id=exercise_id).exists():
        return Response({'error': 'This exercise is already added to the session'}, status=400)

    serializer = SessionEntrySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)