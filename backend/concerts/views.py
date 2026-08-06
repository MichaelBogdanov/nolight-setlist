from rest_framework.generics import RetrieveAPIView

from .models import Concert
from .serializers import ConcertSerializer


class ActiveConcertView(
    RetrieveAPIView
):

    serializer_class = ConcertSerializer


    def get_object(self):

        return Concert.objects.get(
            is_active=True
        )