from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from base.views import RegisterView, LoginView, UserDetailView, LogoutView

urlpatterns = [
    path('admin/', admin.site.urls),
    # Auth endpoints
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', UserDetailView.as_view(), name='user_detail'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    # API endpoints (SessionViewSet, ExerciseViewSet, etc.)
    path('api/', include('api.urls')),
]
