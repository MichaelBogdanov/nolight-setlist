from django.db import models


class Song(models.Model):
    title = models.CharField(
        max_length=200,
        verbose_name="Название песни"
    )

    lyrics = models.TextField(
        verbose_name="Текст песни"
    )


    class Meta:
        verbose_name = "Песня"
        verbose_name_plural = "Песни"


    def __str__(self):
        return self.title



class Concert(models.Model):
    name = models.CharField(
        max_length=200,
        verbose_name="Название концерта"
    )

    date = models.DateField(
        verbose_name="Дата концерта"
    )

    is_active = models.BooleanField(
        default=False,
        verbose_name="Активный концерт"
    )


    class Meta:
        verbose_name = "Концерт"
        verbose_name_plural = "Концерты"


    def save(self, *args, **kwargs):
        if self.is_active:
            Concert.objects.filter(
                is_active=True
            ).update(is_active=False)

        super().save(*args, **kwargs)


    def __str__(self):
        return self.name



class ConcertSong(models.Model):
    concert = models.ForeignKey(
        Concert,
        on_delete=models.CASCADE,
        verbose_name="Концерт",
        related_name="songs"
    )

    song = models.ForeignKey(
        Song,
        on_delete=models.CASCADE,
        verbose_name="Песня"
    )

    position = models.PositiveIntegerField(
        default=0,
        verbose_name="Позиция в сетлисте"
    )


    class Meta:
        verbose_name = "Песня на концерте"
        verbose_name_plural = "Песни на концерте"

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "concert",
                    "song"
                ],
                name="unique_song_per_concert"
            )
        ]

        ordering = [
            "position"
        ]


    def __str__(self):
        return self.song.title