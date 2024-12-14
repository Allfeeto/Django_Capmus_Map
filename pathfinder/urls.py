from django.urls import path
from . import views

urlpatterns = [
    path('find-route/', views.FindRouteView.as_view(), name='find_route'),
    path('get-floor-route/<int:floor_number>/', views.GetFloorRouteView.as_view(), name='get_floor_route'),

    # Другие маршруты
]
