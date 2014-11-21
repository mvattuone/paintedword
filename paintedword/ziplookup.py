from django.db import models
from django.contrib.localflavor.us import models as us_models

class ZipCode(models.Model):
    zipcode = models.CharField(max_length=10,db_index=True)
    city = models.CharField(max_length=255)
    state = us_models.USPostalCodeField()
    
    def __unicode__(self):
        return self.zipcode

from django.http import HttpResponse,HttpResponseServerError
from django.shortcuts import render_to_response
from django.conf import settings
import json

from models import ZipCode

def zip_lookup(request):
    
    zip5 = request.GET.get('zip')
    if zip5:
        try:
            place = ZipCode.objects.get(zipcode=zip5)
            cleaned = {}
            cleaned['city'] = place.city.lower().title()
            cleaned['state'] = place.state
            cleaned['zip'] = place.zipcode
            #print cleaned
        except ZipCode.DoesNotExist:
            #print e
            return HttpResponse(json.dumps({'error':'invalid zipcode'}),mimetype="application/json")
    else:
        return HttpResponseServerError('requires zip get parameter')
    return HttpResponse(json.dumps(cleaned),mimetype="application/json")