from django import template
from paintedword.forms import *

register = template.Library()

@register.inclusion_tag('results.html')
def gallery():
	pass

@register.inclusion_tag('signup_form.html')
def signup_form(page):
	return {'page': page}

@register.inclusion_tag('photo_caption.html')
def photo_caption(default_message):
	return {'default_message': default_message}

@register.inclusion_tag('photo_upload.html')
def photo_upload(options):
	raw_form = RawPhotoForm()
	return {'raw_form': raw_form }