from django.db import models


class Plant(models.Model):
    common_name = models.CharField(max_length=512)
    scientific_name = models.CharField(max_length=1024)
    is_succulent = models.NullBooleanField()
    is_evergreen = models.NullBooleanField()

    def __unicode__(self):
        return self.common_name


class Animal(models.Model):
    common_name = models.CharField(max_length=512)
    scientific_name = models.CharField(max_length=1024)
    is_mammal = models.NullBooleanField()
    is_reptile = models.NullBooleanField()
    is_arachnid = models.NullBooleanField()

    def __unicode__(self):
        return self.common_name