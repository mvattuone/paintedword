from django.db import models
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.core.urlresolvers import reverse

media = FileSystemStorage()

def example_file_name(instance, filename):
    return "photos/%s/example.png" % (instance.slug)
def captioned_file_name(instance, filename):
    return "photos/%s/%d_caption.png" % (instance.campaign.slug,instance.pk)

class PhotoCampaign(models.Model):
    title = models.CharField(max_length=50)
    slug = models.SlugField()
    logo = models.ImageField(upload_to='logos/', storage=media, null=True, blank=True)
    description = models.TextField()
    disclaimer = models.TextField(help_text="Disclaimer that should appear with the form (privacy policy, terms, etc.")
    default_message = models.TextField(null=True,blank=True)
    example_photo = models.ImageField(upload_to=example_file_name,null=True,blank=True)
    ak_page_name = models.CharField(help_text="name of the page to act on the user",max_length=50,null=True,blank=True)
    
    def get_absolute_url(self):
        return reverse('paintedword.views.render_photo_campaign',kwargs={'slug': self.slug})
    
    def __unicode__(self):
        return '%s, %s' % (self.title, self.description,)
    
    def render_example_photo(self):
        return '<img src="%s%s">' % (settings.MEDIA_URL, self.example_photo,)

class Photo(models.Model):
    campaign = models.ForeignKey(PhotoCampaign)
    name = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=5)
    email = models.EmailField(max_length=75)
    message = models.CharField(max_length=280,null=True,blank=True)
    akid = models.PositiveIntegerField(null=True,blank=True)
    captioned_photo = models.ImageField(upload_to=captioned_file_name, storage=media)
    approved = models.BooleanField()

    def final_photo(self):
        return '<img src="/media/%s" width="320" height="240" />' % self.captioned_photo
    final_photo.allow_tags = True
        
    def __unicode__(self):
        return "%s, %s, %s" % (self.name, self.zip_code, self.email,)
