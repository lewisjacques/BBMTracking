from django.apps import AppConfig

class BaseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'base'
    
    def ready(self):
        """
        Extend Django User model with activate() method for schema context.
        
        This is called when Django starts up, allowing us to add methods to
        the User model without creating a custom User model.
        """
        from django.contrib.auth.models import User
        from base.utils.user_context import activate
        
        # Add activate method to User model
        User.activate = activate

