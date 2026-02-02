from django.contrib.auth.models import AbstractUser
from django.db import models
# Create your models here.


class User(AbstractUser):
    def __str__(self):
        return f"{self.username}"


class Task(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name="tasks")
    is_complete = models.BooleanField(default=False)
    title = models.CharField(max_length=32)
    description = models.CharField(max_length=300,blank=True)
    added_on = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"id {self.pk},{self.title}"