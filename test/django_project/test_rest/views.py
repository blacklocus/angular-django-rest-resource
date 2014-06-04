from rest_framework import viewsets
from test_rest.models import Animal, Plant
from test_rest.serializers import AnimalSerializer, PlantSerializer


class AnimalViewSet(viewsets.ModelViewSet):
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer


class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plant.objects.all()
    serializer_class = PlantSerializer