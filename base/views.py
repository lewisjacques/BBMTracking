from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import connection
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer
from .utils.user_context import create_user_schema

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Create user's schema with tables
            try:
                create_user_schema(user.id)
            except Exception as e:
                # Log error but don't fail registration
                print(f"Error creating schema for user {user.id}: {str(e)}")
            
            return Response({
                'message': 'User created successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current user details"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Token blacklisting is handled by simplejwt
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
