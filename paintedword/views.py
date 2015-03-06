from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse,HttpResponseBadRequest,HttpResponseServerError
from django.core.files.base import ContentFile
from django.conf import settings
from django.shortcuts import render
import json
import StringIO
import traceback
import re
from django.core.files.base import ContentFile
import tempfile

from ak_support.views import ak_connect

from PIL import Image
from PIL import ExifTags

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
        'disclaimer':campaign.disclaimer,
        'page_name':campaign.ak_page_name,
        'example_photo': campaign.render_example_photo(),
        'default_message': campaign.default_message,
        'campaign_link': campaign.get_absolute_url(),
    }

    return render(request, "paintedword.html", dictionary=context)
   
@csrf_exempt
def upload_raw_photo(request,slug):
    if request.method == 'POST':
        if request.FILES and request.FILES['photo']:
            raw_content_file = request.FILES['photo']
        else:
            raw_content_file = ContentFile(request.body)
 
        print "howdy from djangolandia"
 
        img = Image.open(raw_content_file)
        output = StringIO.StringIO() #temporarily mess w/ image in memory

        t_dim = (1024,1024)
        i_dim = img.size
        compare_image_to_thumb = [(i_dim > t_dim) for i_dim, t_dim in zip(i_dim,t_dim)]
        if True in compare_image_to_thumb:
            t_dim = (1024,1024) #TODO: Remove stupid repeat variable
            img.thumbnail(t_dim, Image.ANTIALIAS)
            print "Resized, yo"
        else:
            print 'You just stay the way you are.'
        
        # try to get image exif and flip here on the server
        try:
            for orientation in ExifTags.TAGS.keys() :
                if ExifTags.TAGS[orientation] == 'Orientation' : break
            exif = dict(img._getexif().items())
            print "my orientation code is:"
            print(exif[orientation])

            if exif[orientation] == 3 :
                img = img.rotate(180, expand=True)
                print "Flipped, yo"
            elif exif[orientation] == 6 :
                img = img.rotate(-90, expand=True)
                print "Flipped, yo"
            elif exif[orientation] == 8 :
                img = img.rotate(90, expand=True)
                print "Flipped, yo"
                
        except:
            traceback.print_exc()

        img.save(output,'png')
        output.seek(0)


        img_output = output.read()
        import base64
        encoded_string = base64.b64encode(img_output)
        # print encoded_string
        data = {
            'success': True,
            'resized_file': encoded_string
        }
    else:
        data = {'success': False, 'message':"must post to this url"}
    return HttpResponse(json.dumps(data),mimetype="text/html")

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
