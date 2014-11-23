from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse,HttpResponseBadRequest,HttpResponseServerError
from django.core.files.base import ContentFile
from django.conf import settings
from django.shortcuts import render
import json

import re
from django.core.files.base import ContentFile
import tempfile

from ak_support.views import ak_connect

from models import *
from forms import *


def render_photo_campaign(request,slug):
    context = {}

    campaign = get_object_or_404(PhotoCampaign,slug=slug)
    form = PhotoForm()
    photoupload = PhotoForm(request.POST or None)

    if form.is_valid():
        new_photo = form.save()

    response_data = {
        'form': form,
    }

    form = PhotoForm(request.POST or None, request.FILES or None)

    if form.is_valid():
        new_upload = form.save()
    else:
        print form.errors

    context = {
        'photos': Photo.objects.filter(campaign=campaign,approved=True),
        'form': form,
        'logo':campaign.logo,
        'title':campaign.title,
        'description':campaign.description,
        'page_name':campaign.ak_page_name,
        'example_photo': campaign.render_example_photo(),
        'default_message': campaign.default_message,
        'campaign_link': campaign.get_absolute_url(),
    }

    return render(request, "paintedword.html", dictionary=context)
        
@csrf_exempt
def submit(request,slug):
    required_fields = ['name','captioned_photo']
    for f in required_fields:
        if request.POST.get(f) == "":
            resp = {'message':'%s is required' % f,
                    'field':f}
            return HttpResponseBadRequest(json.dumps(resp),mimetype="application/json")

    #decode the dataurl
    dataurl = request.POST['captioned_photo']
    encoded_photo = re.search(r'base64,(.*)', dataurl).group(1)
    decoded_photo = encoded_photo.decode('base64')

    #save it to a ContentFile
    captioned_content_file = ContentFile(decoded_photo)
    captioned_file_name = "test_upload.png"

	#create the django photo object
    try:
        campaign = PhotoCampaign.objects.get(slug=slug)
    except PhotoCampaign.DoesNotExist:
        resp = {'message':'no such campaign %s' % slug}
        return HttpResponseServerError(json.dumps(resp),mimetype="application/json")

    new_photo = Photo.objects.create(name=request.POST.get('name'),
                                     campaign=campaign,)
    try:
        new_photo.captioned_photo.save(captioned_file_name,captioned_content_file)
        new_photo.save()
        resp = {'message':'success'}
    except Exception:
        resp = {"message":"error"}

    return HttpResponse(json.dumps(resp),mimetype="application/json")
