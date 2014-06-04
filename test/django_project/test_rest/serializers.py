from rest_framework import serializers
from test_rest.models import Animal
from test_rest.models import Plant


class AnimalSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Animal


class PlantSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Plant
