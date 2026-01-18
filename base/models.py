from django.db import models

class MuscleGroup(models.Model):
    muscle_group_name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.muscle_group_name

class ExerciseType(models.Model):
    type_name = models.CharField(max_length=100, unique=True)  # Barbell, Dumbell, Cable, etc.
    
    def __str__(self):
        return self.type_name

class Exercise(models.Model):
    exercise_name = models.CharField(max_length=100)
    exercise_name_legacy = models.CharField(max_length=200, default='')
    muscle_group = models.ForeignKey(MuscleGroup, on_delete=models.PROTECT)
    exercise_type = models.ForeignKey(ExerciseType, on_delete=models.PROTECT, null=True, blank=True)

class Session(models.Model):
    date = models.DateField()
    notes = models.TextField(blank=True, default='')
    completed = models.BooleanField(default=True)

# Each SessionEntry belongs to one Session
class SessionEntry(models.Model):
    # Foreign key implies many-to-one relationship
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    # to_field is an argument within ForeignKey that specifies which field the ForeignKey should reference
    exercise = models.ForeignKey(Exercise, on_delete=models.PROTECT)
    # Char at the moment because there are time stamps in there that need handling differently
    weight = models.CharField(max_length=50)
    status = models.CharField(max_length=50)