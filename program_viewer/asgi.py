"""
ASGI config for program_viewer project.
It exposes the ASGI callable as a module-level variable named ``application``.
"""

from django.core.asgi import get_asgi_application
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'program_viewer.settings')

application = get_asgi_application()