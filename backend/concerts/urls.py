from django.urls import path

from .views import ActiveConcertView


urlpatterns = [
    path(
        "active/",
        ActiveConcertView.as_view()
    )
]