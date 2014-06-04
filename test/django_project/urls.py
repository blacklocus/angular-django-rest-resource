from django.conf import settings
from django.conf.urls import patterns, include, url
from django.views.generic.base import RedirectView
from rest_framework import routers
from test_rest import views
from os import path

from django.contrib import admin
admin.autodiscover()

rest_router = routers.DefaultRouter()
rest_router.register(r'animals', views.AnimalViewSet)
rest_router.register(r'plants', views.PlantViewSet)

urlpatterns = patterns('',
    url(r'^$', RedirectView.as_view(url="/static/index.html")),
    url(r'^(?P<path>angular-django-rest-resource\.js)$', 'django.views.static.serve', {
        'document_root': path.join(settings.BASE_DIR, ".."),
    }),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^', include(rest_router.urls)),
)