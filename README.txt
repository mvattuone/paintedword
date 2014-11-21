painted-word
=========================

This is a tool that allows people to take a photo from the browser, add a caption that will attach a logo of your choice, and submit it.  When an admin approves the image, it will render on the photo campaign index page.  Think of this as an out of the box 'wearethe99percent', without having to sign up for Tumblr and deal with their limits on photo submissions.

In the future, there may or may not be integration using the Actionkit CRM, as that is what we use at CEL, and this might allow people to instantly see their image upload without requiring approval.

Written mostly by Mike Vattuone at Citizen Engagement Laboratory, with support from Josh Levinger.

Installation
=========

Pretty dang easy:

* Add 'paintedword' to your INSTALLED_APPS. 

* Add the app to your urls.py
urlpatterns = patterns('',
	url(r'^photo/', include('paintedword.urls'))
)

* In the admin, create a Photo Campaign, including an example photo and logo, and view the campaign index page or take a picture at yourdomain.com/photo/campaign_slug

* ...profit?  

While I am imagining a system that will easily integrate with your base template and make it so that you don't have to do any front-end to get this to play nicely, this is probably idealistic.  One thing we could try to do is create a TEMPLATE_PATH in which you would render your paintedword views to, but this will be something for later on...


FAQ
=========

Q: This used to be called django-webcam-photoupload? What's with the stupid name?

A: If a successful build tool can be named after a brunch-lunch hybrid, then I can name my app after a Television Personalities song. Simple, really.

Get involved
=========

Have an idea for how to make this more useful?  A handy abstraction?  Please let me know!


