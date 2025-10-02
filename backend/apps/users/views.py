from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, UserDetailSerializer
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from drf_spectacular.utils import extend_schema



# Register
class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            # Grab only the first error and stop
            first_field, first_error_list = next(iter(serializer.errors.items()))
            first_error = first_error_list[0]
            return Response({"error": f"{first_error}"}, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Login
@extend_schema(request=LoginSerializer, responses=LoginSerializer)
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            response = Response({
                "access": access_token,
                "user": {"username": user.username, "email": user.email}
            })
            response.set_cookie(
                key='refreshToken',
                value=str(refresh),
                httponly=True,
                secure=True,
                samesite='None',
                max_age=7*24*60*60,
                path='/'
            )
            return response

        return Response({"error": "Invalid credentials"}, status=401)


@extend_schema(responses=UserDetailSerializer)
class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)


class CookieTokenRefreshView(TokenRefreshView):
    """
    Override TokenRefreshView to use HttpOnly refresh cookie only.
    """
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refreshToken')
        if not refresh_token:
            return Response({"error": "No refresh token provided"}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = TokenRefreshSerializer(data={"refresh": refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

        validated = serializer.validated_data
        access_token = validated["access"]

        response = Response({"access": access_token})

        # Update refresh cookie only if rotation is enabled
        if "refresh" in validated:
            response.set_cookie(
                key='refreshToken',
                value=str(validated["refresh"]),
                httponly=True,           # Not accessible by JS
                secure=True,             # Only sent over HTTPS, to be changed
                samesite='None',       # Protect against CSRF
                max_age=7*24*60*60,      # 7 days in seconds
                path='/'  # Only sent to refresh endpoint
            )

        return response
