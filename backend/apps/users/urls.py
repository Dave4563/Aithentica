from django.urls import path
from .views import RegisterView, LoginView, UserDetailView, CookieTokenRefreshView

urlpatterns = [
    path('registration/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),

]