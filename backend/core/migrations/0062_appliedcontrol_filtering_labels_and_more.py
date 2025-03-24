# Generated by Django 5.1.7 on 2025-03-20 18:13

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0061_findingsassessment_ref_id"),
    ]

    operations = [
        migrations.AddField(
            model_name="appliedcontrol",
            name="filtering_labels",
            field=models.ManyToManyField(
                blank=True, to="core.filteringlabel", verbose_name="Labels"
            ),
        ),
        migrations.AddField(
            model_name="referencecontrol",
            name="filtering_labels",
            field=models.ManyToManyField(
                blank=True, to="core.filteringlabel", verbose_name="Labels"
            ),
        ),
        migrations.AddField(
            model_name="threat",
            name="filtering_labels",
            field=models.ManyToManyField(
                blank=True, to="core.filteringlabel", verbose_name="Labels"
            ),
        ),
    ]
