from .models import Notification

def create_notification(user, message, type="info", redirect_url=None):
    """
    Creates a notification for the given user.
    """
    if user is None:
        return None

    return Notification.objects.create(
        user=user,
        message=message,
        type=type,
        redirect_url=redirect_url
    )
