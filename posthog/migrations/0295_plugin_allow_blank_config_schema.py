# Generated by Django 3.2.16 on 2023-01-23 19:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("posthog", "0294_plugin_blank_fields"),
    ]

    operations = [
        migrations.AlterField(
            model_name="plugin",
            name="config_schema",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
