from django.contrib.auth import get_user_model, authenticate, login as django_login
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse, FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.conf import settings
from .utils import create_notification
from .models import Notification


import random
import json

# Models & Serializers
from .models import Skill
from .serializers import SkillSerializer, UserSerializer

# DRF imports
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

# JWT
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# Temporary OTP store
otp_storage = {}

# ------------------ OTP for Registration ------------------
@csrf_exempt
def send_otp_registration(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")

            if not email:
                return JsonResponse({"success": False, "message": "Email is required."})

            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    "success": False,
                    "message": "Email already registered. Please login instead."
                })

            otp = str(random.randint(100000, 999999))
            otp_storage[email] = otp

            send_mail(
                subject="Your Registration OTP",
                message=f"Your OTP is: {otp}",
                from_email="moizmohd0728@gmail.com",
                recipient_list=[email],
                fail_silently=False,
            )
            return JsonResponse({"success": True, "message": "OTP sent successfully."})

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})
    return JsonResponse({"success": False, "message": "Invalid request method."})


# ------------------ OTP for Login ------------------
@csrf_exempt
def send_otp_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")

            if not email:
                return JsonResponse({"success": False, "message": "Email is required."})

            if not User.objects.filter(email=email).exists():
                return JsonResponse({
                    "success": False,
                    "message": "Email not registered. Please register first."
                })

            otp = str(random.randint(100000, 999999))
            otp_storage[email] = otp

            send_mail(
                subject="Your Login OTP",
                message=f"Your OTP is: {otp}",
                from_email="moizmohd0728@gmail.com",
                recipient_list=[email],
                fail_silently=False,
            )
            return JsonResponse({"success": True, "message": "OTP sent successfully."})

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})
    return JsonResponse({"success": False, "message": "Invalid request method."})


# ------------------ Verify OTP ------------------
@csrf_exempt
def verify_otp(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            otp = data.get("otp")

            if otp_storage.get(email) == otp:
                return JsonResponse({"success": True, "message": "OTP verified successfully."})
            else:
                return JsonResponse({"success": False, "message": "Invalid OTP."})

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})

    return JsonResponse({"success": False, "message": "Invalid request method."})


# ------------------ Register ------------------
@csrf_exempt
def register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            full_name = data.get('fullName')
            email = data.get('email')
            mobile = data.get('mobile')
            tenth_school = data.get('school10')
            tenth_percentage = data.get('percent10')
            inter_college = data.get('college12')
            inter_percentage = data.get('percent12')
            passout_year = data.get('passoutYear')
            current_percentage = data.get('currentPercent')
            password = data.get('password')
            confirm_password = data.get('confirmPassword')
            otp = data.get('otp')

            if not all([full_name, email, mobile, password, confirm_password, otp]):
                return JsonResponse({"success": False, "message": "Missing required fields."})

            if password != confirm_password:
                return JsonResponse({"success": False, "message": "Passwords do not match."})

            if otp_storage.get(email) != otp:
                return JsonResponse({"success": False, "message": "Invalid or missing OTP."})

            if User.objects.filter(email=email).exists():
                return JsonResponse({"success": False, "message": "User already exists."})

            user = User.objects.create(
                email=email,
                full_name=full_name,
                mobile=mobile,
                tenth_school=tenth_school,
                tenth_percentage=tenth_percentage,
                inter_college=inter_college,
                inter_percentage=inter_percentage,
                passout_year=passout_year,
                current_percentage=current_percentage,
                password=make_password(password),
            )

            otp_storage.pop(email, None)

            # Notification
            create_notification(user, "Registration successful", "success")

            return JsonResponse({"success": True, "message": "User registered successfully!"})

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})

    return JsonResponse({"success": False, "message": "Invalid request method."})


# ------------------ Reset Password ------------------
@csrf_exempt
def reset_password(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            new_password = data.get("newPassword")
            confirm_password = data.get("confirmPassword")

            if new_password != confirm_password:
                return JsonResponse({"success": False, "message": "Passwords do not match."})

            try:
                user = User.objects.get(email=email)
                user.password = make_password(new_password)
                user.save()

                # Notification
                create_notification(user, "Password changed successfully", "success")

                return JsonResponse({"success": True, "message": "Password reset successfully."})

            except User.DoesNotExist:
                return JsonResponse({"success": False, "message": "User not found."})

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})
    return JsonResponse({"success": False, "message": "Invalid request method."})


# ------------------ Login ------------------
@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            user = authenticate(request, email=email, password=password)
            if user is None:
                return JsonResponse({"success": False, "message": "Invalid email or password."})

            django_login(request, user)

            # Notification
            create_notification(user, "Logged in successfully", "info")

            refresh = RefreshToken.for_user(user)

            return JsonResponse({
                "success": True,
                "message": "Logged in successfully.",
                "full_name": user.full_name,
                "email": user.email,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})

    return JsonResponse({"success": False, "message": "Invalid request method."})


# ------------------ User Details ------------------
def get_user_details(request):
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return JsonResponse(serializer.data, safe=False)
    return JsonResponse({"success": False, "message": "Not logged in"})


# ------------------ Skills APIs ------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_skills(request):
    skills = request.user.skills.all()
    return Response(SkillSerializer(skills, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_skill(request):
    name = request.data.get("name")

    if not name:
        return Response({"error": "Skill name is required"}, status=400)

    if request.user.skills.filter(name__iexact=name).exists():
        return Response({"error": "Skill already exists"}, status=400)

    skill = Skill.objects.create(user=request.user, name=name, verified=False)

    # Notification
    create_notification(request.user, f"Skill '{name}' added successfully", "success")

    return Response(SkillSerializer(skill).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_skill(request, skill_id):
    skill = get_object_or_404(Skill, id=skill_id, user=request.user)

    # Notification
    create_notification(request.user, f"Skill '{skill.name}' deleted", "warning")

    skill.delete()
    return Response({"message": "Skill removed successfully"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_skill(request, skill_id):
    skill = get_object_or_404(Skill, id=skill_id, user=request.user)
    skill.verified = True
    skill.save()

    # Notification
    create_notification(request.user, f"{skill.name} certificate verified", "success")

    return Response({"message": "Skill verified", "skill": SkillSerializer(skill).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_skill_certificate(request, skill_id):
    skill = get_object_or_404(Skill, id=skill_id, user=request.user)
    file_obj = request.FILES.get('verification_file')

    if not file_obj:
        return Response({"error": "No file uploaded"}, status=400)

    skill.certificate = file_obj
    skill.save()

    # Notification
    create_notification(request.user, "Certificate uploaded (waiting for verification)", "info")

    return Response(SkillSerializer(skill).data)


# ------------------ Resume Upload/Download/Delete ------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_resume(request):
    user = request.user
    file_obj = request.FILES.get('resume')

    if not file_obj:
        return Response({'error': 'No file uploaded'}, status=400)

    if not file_obj.name.lower().endswith('.pdf'):
        return Response({'error': 'Only PDF files allowed'}, status=400)

    if user.resume:
        user.resume.delete(save=False)

    user.resume = file_obj
    user.save()

    # Notification
    create_notification(user, "Resume uploaded successfully", "success")

    absolute_url = request.build_absolute_uri(user.resume.url)
    return Response({'message': 'Resume uploaded successfully', 'resume_url': absolute_url})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_resume(request):
    user = request.user
    if not user.resume:
        raise Http404

    response = FileResponse(user.resume.open('rb'), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{user.resume.name.split("/")[-1]}"'
    return response


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_resume(request):
    user = request.user
    if not user.resume:
        return Response({'error': 'No resume to delete'}, status=404)

    # Notification
    create_notification(user, "Resume deleted", "warning")

    user.resume.delete(save=True)
    return Response({'message': 'Resume deleted successfully'})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_resume(request):
    if request.user.resume:
        resume_url = request.build_absolute_uri(request.user.resume.url)
        return Response({"resume_url": resume_url})
    return Response({"resume_url": None})
# ------------------ Notifications Dropdown ------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_unread_notifications(request):
    notifications = Notification.objects.filter(user=request.user, is_read=False).order_by("-created_at")
    data = [
        {
            "id": n.id,
            "message": n.message,
            "type": n.type,
            "created_at": n.created_at,
            "redirect_url": n.redirect_url,
        }
        for n in notifications
    ]
    return Response({"notifications": data, "count": len(data)})
#---------------------- all read ----------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({"message": "All notifications marked as read"})
#-------------------- Notification Page -----------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by("-created_at")
    data = [
        {
            "id": n.id,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at,
            "redirect_url": n.redirect_url,
        }
        for n in notifications
    ]
    return Response({"notifications": data})
#------------------ Delete Notification ---------
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    notification.delete()
    return Response({"message": "Notification deleted"})
