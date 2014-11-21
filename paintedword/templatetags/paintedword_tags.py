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
def photo_upload(options):
	raw_form = RawPhotoForm()
	if options == 'no_webcam':
		no_webcam = True
	return {'raw_form': raw_form, 'no_webcam': no_webcam, }