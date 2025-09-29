from django.urls import path
from .views import chat_view, pollinations_vision_view, pollinations_text_view, chat_history_view

urlpatterns = [
    path("chat/", chat_view, name="llm-request"),
    path("chat_pollinations/", pollinations_text_view, name="llm-pollinations-request"),
    path("vision/", pollinations_vision_view, name="vision-request"),
    path("chat_history/", chat_history_view, name="chat-history-view")
]

