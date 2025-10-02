from rest_framework import generics, permissions
from rest_framework.response import Response
from apps.users.models import UserTokenUsage
from apps.llms.models import ChatHistory
from .services import Generator
from urllib.parse import quote
import requests
from .serializers import (
    ChatInputSerializer, ChatOutputSerializer, ChatHistoryOutputSerializer,
    PollinationsTextInputSerializer, PollinationsTextOutputSerializer,
    PollinationsVisionInputSerializer, PollinationsVisionOutputSerializer
)

VALID_MODELS = ["flux", "kontext", "turbo", "nanobanana", "seedream"]

# --- Chat View ---
class ChatView(generics.GenericAPIView):
    serializer_class = ChatInputSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        gen = Generator(provider=data["provider"], model_name=data["model"])
        result = gen.generate(data["system_prompt"], data["user_prompt"])

        usage = result["usage"]
        token_usage, _ = UserTokenUsage.objects.get_or_create(user=request.user)
        token_usage.prompt_tokens += usage.get("prompt_tokens", 0)
        token_usage.completion_tokens += usage.get("completion_tokens", 0)
        token_usage.total_tokens += usage.get("total_tokens", 0)
        token_usage.save()

        # Save chat history
        ChatHistory.objects.create(
            user=request.user,
            question=data["user_prompt"],
            answer=result["content"]
        )

        output_serializer = ChatOutputSerializer({"content": result["content"]})
        return Response(output_serializer.data)


# --- Pollinations Text View ---
class PollinationsTextView(generics.GenericAPIView):
    serializer_class = PollinationsTextInputSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        prompt = serializer.validated_data["prompt"]

        url = f"https://text.pollinations.ai/{quote(prompt)}"
        try:
            response = requests.get(url)
            if response.status_code != 200:
                return Response({"error": "Failed to generate text"}, status=500)
            text_result = response.text
        except requests.RequestException as e:
            return Response({"error": str(e)}, status=500)

        ChatHistory.objects.create(user=request.user, question=prompt, answer=text_result)

        output_serializer = PollinationsTextOutputSerializer({"prompt": prompt, "text": text_result})
        return Response(output_serializer.data)


# --- Pollinations Vision View ---
class PollinationsVisionView(generics.GenericAPIView):
    serializer_class = PollinationsVisionInputSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if data["model"] not in VALID_MODELS:
            return Response({"error": f"Invalid model. Choose one of {VALID_MODELS}"}, status=400)

        prompt_encoded = quote(data["prompt"])
        image_url = f"https://pollinations.ai/p/{prompt_encoded}?width={data['width']}&height={data['height']}&seed={data['seed']}&model={data['model']}"

        try:
            response = requests.get(image_url, allow_redirects=True, timeout=10)
            if response.status_code != 200:
                return Response({"error": "Failed to generate image"}, status=500)
        except requests.RequestException as e:
            return Response({"error": str(e)}, status=500)

        output_serializer = PollinationsVisionOutputSerializer({
            "prompt": data["prompt"],
            "image_url": image_url,
            "model": data["model"],
            "width": data["width"],
            "height": data["height"],
            "seed": data["seed"],
        })
        return Response(output_serializer.data)


# --- Chat History View ---
class ChatHistoryView(generics.ListAPIView):
    serializer_class = ChatHistoryOutputSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatHistory.objects.filter(user=self.request.user).order_by("-created_at")[:5]
