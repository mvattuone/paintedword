from django import template
from paintedword.forms import *

register = template.Library()

@register.inclusion_tag('results.html')
def gallery():
	pass

@register.inclusion_tag('signup_form.html')
def signup_form(page):
	return {'page': page}

@register.inclusion_tag('photo_upload.html')
def photo_upload(default_message, example_photo):
	return {
		'default_message': default_message,
		'example_photo': example_photo,
	}