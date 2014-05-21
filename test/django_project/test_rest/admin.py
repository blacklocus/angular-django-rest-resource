from django.contrib import admin

from test_rest.models import Plant, Animal

# Register your models here.
admin.site.register(Plant)
admin.site.register(Animal)