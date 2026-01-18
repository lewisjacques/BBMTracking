from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register ViewSets
router = DefaultRouter()
router.register(r'exercises', views.ExerciseViewSet, basename='exercise')
router.register(r'sessions', views.SessionViewSet, basename='session')
router.register(r'session-entries', views.SessionEntryViewSet, basename='session-entry')
router.register(r'muscle-groups', views.MuscleGroupViewSet, basename='muscle-group')

urlpatterns = [
    path('', include(router.urls)),
]