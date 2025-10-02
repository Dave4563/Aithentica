from django.urls import path
from .views import ChatView, PollinationsVisionView, PollinationsTextView, ChatHistoryView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='chat'),
    path('chat_pollinations/', PollinationsTextView.as_view(), name='pollinations_text'),
    path('vision/', PollinationsVisionView.as_view(), name='pollinations_vision'),
    path('chat_history/', ChatHistoryView.as_view(), name='chat_history'),
]
