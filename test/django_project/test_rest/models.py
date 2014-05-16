from django.db import models


# Create your models here.
class Plant(models.Model):
    common_name = models.CharField(max_length=512)
    scientific_name = models.CharField(max_length=1024)
    is_succulent = models.BooleanField()
    is_evergreen = models.BooleanField()

class Animal(models.Model):
    common_name = models.CharField(max_length=512)
    scientific_name = models.CharField(max_length=1024)
    is_mammal = models.BooleanField()
    is_reptile = models.BooleanField()
    is_arachnid = models.BooleanField()