from rest_framework import serializers
from apps.llms.models import ChatHistory

# --- Chat serializers ---
class ChatInputSerializer(serializers.Serializer):
    provider = serializers.CharField(required=True)
    model = serializers.CharField(required=True)
    system_prompt = serializers.CharField(required=True)
    user_prompt = serializers.CharField(required=True)

class ChatOutputSerializer(serializers.Serializer):
    content = serializers.CharField()

class ChatHistoryOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatHistory
        fields = ["question", "answer", "created_at"]


# --- Pollinations Text serializers ---
class PollinationsTextInputSerializer(serializers.Serializer):
    prompt = serializers.CharField(required=True)

class PollinationsTextOutputSerializer(serializers.Serializer):
    prompt = serializers.CharField()
    text = serializers.CharField()


# --- Pollinations Vision serializers ---
class PollinationsVisionInputSerializer(serializers.Serializer):
    prompt = serializers.CharField(required=True)
    model = serializers.CharField(default="flux")
    width = serializers.IntegerField(default=1024)
    height = serializers.IntegerField(default=1024)
    seed = serializers.IntegerField(default=42)

class PollinationsVisionOutputSerializer(serializers.Serializer):
    prompt = serializers.CharField()
    image_url = serializers.URLField()
    model = serializers.CharField()
    width = serializers.IntegerField()
    height = serializers.IntegerField()
    seed = serializers.IntegerField()
