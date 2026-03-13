from django.shortcuts import render
from .statistiques import Statistique

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import PlantData
from .serializers import PlantDataSerializer

@api_view(['POST'])
def add_plant_data(request):
    serializer = PlantDataSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)








@api_view(['GET'])
def get_stats(request):
    try:
        donnees = PlantData.objects.all()

        # Vérifie qu'il y a des données
        if not donnees.exists():
            return Response({'erreur': 'Aucune donnée disponible'}, status=404)

        temperatures = list(donnees.values_list('temperature', flat=True))
        humidites = list(donnees.values_list('humidity', flat=True))

        stat_temp = Statistique(None, None, None, None)
        stat_temp.calculer(temperatures)
        stat_hum = Statistique(None, None, None, None)
        stat_hum.calculer(humidites)

        dernieres = PlantData.objects.order_by('-created_at')[:7]

        return Response({
            'temperature': {
                'minimum': stat_temp.minimum,
                'maximum': stat_temp.maximum,
                'moyenne': round(stat_temp.moyenne, 1),
                'mediane': stat_temp.mediane,
                'historique': list(dernieres.values_list('temperature', flat=True))
            },
            'humidite': {
                'minimum': stat_hum.minimum,
                'maximum': stat_hum.maximum,
                'moyenne': round(stat_hum.moyenne, 1),
                'mediane': stat_hum.mediane,
                'historique': list(dernieres.values_list('humidity', flat=True))
            },
            'labels': [d.created_at.strftime('%H:%M') for d in dernieres]
        })

    except Exception as e:
        # Si quelque chose bug, retourne une erreur propre
        return Response({'erreur': str(e)}, status=500)


@api_view(['GET'])
def get_latest(request):
    try:
        derniere = PlantData.objects.latest('created_at')
        return Response({
            'temperature': derniere.temperature,
            'humidity': derniere.humidity
        })

    except PlantData.DoesNotExist:
        # Si la base est vide
        return Response({'erreur': 'Aucune donnée disponible'}, status=404)

    except Exception as e:
        # Si autre erreur
        return Response({'erreur': str(e)}, status=500)