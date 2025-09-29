# apps/llms/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from apps.users.models import UserTokenUsage

@receiver(post_save, sender=User)
def create_token_usage(sender, instance, created, **kwargs):
    if created:
        UserTokenUsage.objects.create(user=instance)
