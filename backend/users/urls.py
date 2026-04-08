from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from .views import (
    send_otp_registration,
    send_otp_login,
    verify_otp,
    register,
    reset_password,
    login_view,
    get_user_details,
    get_skills,
    add_skill,
    delete_skill,
    verify_skill,
    upload_skill_certificate,
    upload_resume,
    download_resume,
    delete_resume,
    get_resume,
    get_unread_notifications,
    mark_notifications_read,
    get_all_notifications,
    delete_notification
)

urlpatterns = [
    path('send-otp-registration/', send_otp_registration),
    path('send-otp-login/', send_otp_login),
    path('verify-otp/', verify_otp),
    path('register/', register),
    path('reset-password/', reset_password),
    path('login/', login_view),
    path("get-user/", get_user_details),

    # Skills APIs
    path("skills/", get_skills),
    path("skills/add/", add_skill),
    path("skills/delete/<int:skill_id>/", delete_skill),
    path("skills/verify/<int:skill_id>/", verify_skill),
    path("skills/upload/<int:skill_id>/", upload_skill_certificate),

    # Resume APIs
    path('resume/upload/', upload_resume),
    path('resume/download/', download_resume),
    path('resume/delete/', delete_resume),
    path('resume/get/', get_resume),

    #Notification APIs
    path("notifications/unread/", get_unread_notifications),
    path("notifications/mark-read/", mark_notifications_read),
    path("notifications/all/", get_all_notifications),
    path("notifications/delete/<int:notification_id>/", delete_notification),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
