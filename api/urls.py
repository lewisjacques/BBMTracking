from django.urls import path
from . import views

urlpatterns = [
    path('', views.getExercises, name='get_exercises'),
    path('getMuscleGroups', views.getMuscleGroups, name='get_muscle_groups'),
    path('getSessions', views.getSessions, name='get_sessions'),
    path('getSession/<int:pk>/', views.getSession, name='get_session'),
    path('addExercise/', views.addExercise, name='add_exercise'),
    path('addSession/', views.addSession, name='add_session'),
]