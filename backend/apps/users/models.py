# apps/users/models.py
from django.db import models
from django.contrib.auth.models import User

class UserTokenUsage(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="token_usage")
    prompt_tokens = models.IntegerField(default=0)
    completion_tokens = models.IntegerField(default=0)
    total_tokens = models.IntegerField(default=0)

    def __str__(self):
        return f"Usage for {self.user.username}"
