from django.conf.urls import patterns, include, url
from rest_framework import routers
from test_rest import views

from django.contrib import admin
admin.autodiscover()

rest_router = routers.DefaultRouter()
rest_router.register(r'animals', views.AnimalViewSet)
rest_router.register(r'plants', views.PlantViewSet)

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^', include(rest_router.urls)),
)