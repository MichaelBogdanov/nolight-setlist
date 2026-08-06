from django.contrib import admin
from adminsortable2.admin import (
    SortableAdminBase,
    SortableInlineAdminMixin,
)

from .models import (
    Song,
    Concert,
    ConcertSong,
)


@admin.register(Song)
class SongAdmin(admin.ModelAdmin):

    list_display = (
        "title",
    )

    search_fields = (
        "title",
    )


class ConcertSongInline(
    SortableInlineAdminMixin,
    admin.TabularInline
):

    model = ConcertSong

    extra = 1

    autocomplete_fields = [
        "song",
    ]

    fields = (
        "song",
    )

    verbose_name = "Песня в сетлисте"
    verbose_name_plural = "Сетлист концерта"


@admin.register(Concert)
class ConcertAdmin(
    SortableAdminBase,
    admin.ModelAdmin
):

    list_display = (
        "name",
        "date",
        "is_active",
    )

    list_filter = (
        "is_active",
    )

    inlines = [
        ConcertSongInline,
    ]