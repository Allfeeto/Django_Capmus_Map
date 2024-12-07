# app/forms.py

from django import forms
from .models import Node


class RouteForm(forms.Form):
    start = forms.ModelChoiceField(
        queryset=Node.objects.all(),
        label="Начальная точка",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    end = forms.ModelChoiceField(
        queryset=Node.objects.all(),
        label="Конечная точка",
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    def clean(self):
        cleaned_data = super().clean()
        start = cleaned_data.get('start')
        end = cleaned_data.get('end')

        if start and end and start == end:
            raise forms.ValidationError("Начальная и конечная точки не должны совпадать.")

        return cleaned_data
