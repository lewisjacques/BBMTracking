"""
WSGI config for program_viewer project.
It exposes the WSGI callable as a module-level variable named ``application``.
"""

from django.core.wsgi import get_wsgi_application
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'program_viewer.settings')

application = get_wsgi_application()