from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.users.models import UserTokenUsage
from .services import Generator
from urllib.parse import quote
import requests
from apps.llms.models import ChatHistory

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_view(request):
    provider = request.data.get("provider", "")
    model = request.data.get("model", "")
    system_prompt = request.data.get("system_prompt", "")
    user_prompt = request.data.get("user_prompt", "")

    gen = Generator(provider=provider, model_name=model) 
    result = gen.generate(system_prompt, user_prompt)

    usage = result["usage"]

    # Count tokens
    token_usage, _ = UserTokenUsage.objects.get_or_create(user=request.user)
    token_usage.prompt_tokens += usage.get("prompt_tokens", 0)
    token_usage.completion_tokens += usage.get("completion_tokens", 0)
    token_usage.total_tokens += usage.get("total_tokens", 0)
    token_usage.save()

    # --- Save chat history ---
    ChatHistory.objects.create(
        user=request.user,
        question=user_prompt,
        answer=result["content"],
    )

    # --- Keep only last 5 entries ---
    history = ChatHistory.objects.filter(user=request.user).order_by("-created_at")
    if history.count() > 2:
        # delete older ones
        for chat in history[2:]:
            chat.delete()

    return Response({
        "content": result["content"],
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pollinations_text_view(request):
    prompt = request.data.get("prompt", "")
    if not prompt:
        return Response({"error": "Prompt parameter is required"}, status=400)

    # Construct Pollinations text URL
    url = f"https://text.pollinations.ai/{prompt.replace(' ', '%20')}"

    try:
        response = requests.get(url)
        if response.status_code != 200:
            return Response({"error": "Failed to generate text"}, status=500)
        text_result = response.text  # text content from the API
    except requests.RequestException as e:
        return Response({"error": str(e)}, status=500)
    
    # --- Save chat history ---
    ChatHistory.objects.create(
        user=request.user,
        question=prompt,
        answer=text_result,
    )

    # --- Keep only last 5 entries ---
    history = ChatHistory.objects.filter(user=request.user).order_by("-created_at")
    if history.count() > 5:
        # delete older ones
        for chat in history[5:]:
            chat.delete()

    return Response({
        "prompt": prompt,
        "text": text_result,
    })
    
VALID_MODELS = ["flux", "kontext", "turbo", "nanobanana", "seedream"]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pollinations_vision_view(request):
    prompt = request.data.get("prompt", "")
    if not prompt:
        return Response({"error": "Prompt parameter is required"}, status=400)

    # Optional parameters with defaults
    model = request.data.get("model", "flux")
    width = int(request.data.get("width", 1024))
    height = int(request.data.get("height", 1024))
    seed = int(request.data.get("seed", 42))

    # Validate model
    if model not in VALID_MODELS:
        return Response({"error": f"Invalid model. Choose one of {VALID_MODELS}"}, status=400)

    # Encode the prompt to handle spaces/special characters
    prompt_encoded = quote(prompt)
    image_url = f"https://pollinations.ai/p/{prompt_encoded}?width={width}&height={height}&seed={seed}&model={model}"

    # Check if the image exists
    try:
        response = requests.get(image_url, allow_redirects=True, timeout=10)
        if response.status_code != 200:
            return Response({"error": "Failed to generate image"}, status=500)
    except requests.RequestException as e:
        return Response({"error": str(e)}, status=500)

    # Return JSON with the URL (frontend can render it)
    return Response({
        "prompt": prompt,
        "image_url": image_url,
        "model": model,
        "width": width,
        "height": height,
        "seed": seed,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_history_view(request):
    history = ChatHistory.objects.filter(user=request.user).order_by("-created_at")[:5]
    return Response([
        {
            "question": h.question,
            "answer": h.answer,
            "created_at": h.created_at,
        }
        for h in history
    ])
