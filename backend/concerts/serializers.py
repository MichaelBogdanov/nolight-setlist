from rest_framework import serializers

from .models import Song, Concert


class SongSerializer(serializers.ModelSerializer):

    class Meta:
        model = Song
        fields = [
            "title",
            "lyrics",
        ]


class ConcertSerializer(serializers.ModelSerializer):

    songs = serializers.SerializerMethodField()

    class Meta:
        model = Concert
        fields = [
            "name",
            "date",
            "songs",
        ]

    def get_songs(self, obj):
        songs = [
            concert_song.song
            for concert_song in obj.songs.all()
        ]

        return SongSerializer(
            songs,
            many=True
        ).data