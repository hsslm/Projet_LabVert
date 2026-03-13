from django.urls import path
from . import views

urlpatterns = [
    path('add/', views.add_plant_data, name='add_plant_data'),
    path('stats/', views.get_stats, name='get_stats'),
    path('latest/', views.get_latest, name='get_latest'),
]
