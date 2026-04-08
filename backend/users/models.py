from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.conf import settings
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)   # used as login field
    mobile = models.CharField(max_length=15, blank=True, null=True)
    tenth_school = models.CharField(max_length=255, blank=True, null=True)
    tenth_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    inter_college = models.CharField(max_length=255, blank=True, null=True)
    inter_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    passout_year = models.IntegerField(blank=True, null=True)
    current_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    def __str__(self):
        return self.email


# -----------------------------
# Skill Model
# -----------------------------
class Skill(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="skills"
    )
    name = models.CharField(max_length=100)

    # File uploaded by user
    certificate = models.FileField(upload_to="certificates/", null=True, blank=True)

    # Auto-verification fields
    verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)

    # Optional certificate verification URL (Coursera, NPTEL, etc.)
    certificate_url = models.URLField(null=True, blank=True)

    # Provider name (Coursera, Udemy, Google, NPTEL...)
    provider = models.CharField(max_length=255, null=True, blank=True)

    # Manual review if auto-verification fails
    needs_manual_review = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "name")
        ordering = ["-verified", "name"]

    def __str__(self):
        return f"{self.user.email} - {self.name} ({'Verified' if self.verified else 'Pending'})"


# -----------------------------
# NEW: Notification Model
# -----------------------------
class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ("success", "Success"),
        ("warning", "Warning"),
        ("info", "Info"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    message = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default="info")

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now)

    # Optional: When clicking notification, go to a page
    redirect_url = models.CharField(max_length=300, null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.message[:30]}"

    class Meta:
        ordering = ["-created_at"]
