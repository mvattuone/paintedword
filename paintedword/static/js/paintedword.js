// global variable to store canvas data
var canvasDataSnapshot = "";

// global var to store image orientation
var image_orientation;

//draw photo to canvas
function drawPhoto(context,image_src, callback) {
  var img = new Image();
  img.src = image_src;
  img.onload = function() {
    context.drawImage(img,0,91,img.width,img.height);
    if (typeof callback !== "undefined") {
      callback(context);
    }
  };
}

function saveImage() {
  var canvas = document.getElementById("canvas"),
  context = canvas.getContext("2d");
  var img = new Image();
  img.src = $('#preview img').data('cropbox').getDataURL("image/png");
  img.onload = function() {
    context.drawImage(img,0,91,img.width,img.height);
    canvasDataSnapshot = context.canvas.toDataURL("image/png");
   }
   console.log("image saved");
}

function drawFrame(context, callback) {
  options = {
    name : $('#name').val(),
    frame_url: frame_url
  };

    //lay out the frame
    if (options.frame_url !== "undefined") {
      var frame = new Image();
      frame.src = options.frame_url;
      frame.onload = function() {
        var canvas = context.canvas;
        context.drawImage(frame,0,0,canvas.clientWidth,canvas.clientHeight);
        //lay out the name
        if (options.name !== "undefined") {
          context.fillStyle = "#FFF";
          context.font = "bold 32px House Slant";
          context.textAlign = "start";
          context.fillText(options.name, 140, 53);
        }

        if (typeof callback !== "undefined") {
          callback(context);
        }
      };
    }

}

var postRawPhoto = function(form, dropbox) {
        $.ajax({
            type: 'POST',
            url:"upload_raw_photo",
            contentType: false,
            processData: false,
            data: form,
        error: function(data) {
            alert('Please select a photo to upload before submitting.')
        },
        success: function(data) {
            // console.log(data);
            var data = $.parseJSON(data);
            //clears canvas
            var canvas = document.getElementById("canvas");
            var context = canvas.getContext("2d");
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0,0,canvas.width,canvas.height);
            current_image = new Image()
            current_image.src = 'data:image/png;base64, ' + data['resized_file']

            // no exif data is available from the returned image
            // so, use orientation info captured earlier
            console.log("Here I am again, later in the program");
            console.log(image_orientation);

            dropbox.appendChild(current_image);
            initCropper();
            context = document.getElementById("canvas").getContext("2d");
            drawFrame(context);
        }
    });
}



function postPhoto(context, access_token) {
  $('input').removeClass('error');
  $('label').removeClass('error');
  var base64img = context.canvas.toDataURL("image/png");
  $.ajax({
    type: 'POST',
    url: 'submit',
    contentType: false,
    data: {
      captioned_photo: base64img,
      name:$('#name').val(),
    },
    error: function(jqXHR, textStatus) {
      var errors = $.parseJSON(jqXHR.responseText);
      $('input#'+errors.field).addClass('error')
      .parent()
      .prepend("<p>" + errors.message + "</p>");
      $('label[for="'+errors.field+'"]').addClass('error');
      $("#share-to-facebook").removeAttr("disabled");
    },
    success: function(jqXHR, textStatus, errorThrown) {
      PostImageToFacebook(access_token);
      saveImage();
      $("#preview, #upload h2, #upload .field, #upload .social-buttons-container, .disclaimer").hide();        
      $("#thank-you").slideDown( 'slow' );   
    }
  });
}

//redraw when we add text and such
function redraw() {
  var canvas = document.getElementById("canvas"),
  context = canvas.getContext("2d");
  drawPhoto(context,$('#preview img').attr('src'), drawFrame);
}

// update the global canvasDataSnapshot variable
function updateCanvasDataSnapshot() {
    var canvas = document.getElementById("canvas");
    var imageData = canvas.toDataURL("image/png");
    canvasDataSnapshot = imageData;
    console.log("canvas snapshot updated");
}

function switchStep(current, next) {
  $('[data-step="' + current + '"]').hide();
  $('[data-step="' + next + '"]').show();
}

function initCropper() {
  $('#preview img').cropbox({
    "width":390,
    "height":263
  });
}

function downloadCanvas(link, imgData, filename) {
  link.href = imgData;
  link.download = filename;
}

function imageUpload(dropbox) {
  var image_dimension_x = 390;
  var image_dimension_y = 390;
  var scaled_width = 0;
  var scaled_height = 0;
  var x1 = 0;
  var y1 = 0;
  var x2 = 0;
  var y2 = 0;
  var current_image = null;
  var ias = null;
  var file = $("#fileInput").get(0).files[0];
  
      // grab orientation data to use later
      loadImage.parseMetaData(
          file,
          function (data) {
              if (!data.imageHead) {
                console.log("no data in image head");
                  return;
              }

              // var orientation = data.exif.getAll();
              var orientation = data.exif.get('Orientation');
              console.log("Photo orientation code:");
              console.log(orientation);
              image_orientation = orientation;
          }
      );

      //var file = document.getElementById('fileInput').files[0];
      var imageType = /image.*/;

      if (file.type.match(imageType)) {
        var reader = new FileReader();

        reader.onload = function(e) {
          var file = $("#fileInput")[0].files[0];
          var rawPhotoForm = new FormData($('#rawPhoto')[0]);
          rawPhotoForm.append('photo', file);
          // console.log(rawPhotoForm);
          switchStep(1,2);
          postRawPhoto(rawPhotoForm, dropbox);
        }
        reader.readAsDataURL(file);

      } else {
        dropbox.innerHTML = "File not supported!";
      }
    }

    $("#name").change(function() {

      var canvas = document.getElementById("canvas"),
      context = canvas.getContext("2d");
      drawFrame(context);
      // saveImage();

    });

    function charCountDown(inputEl, counterEl) {
          if(!inputEl || !counterEl){return false}; // catches errors
          var limit = inputEl.maxLength;
          var counter = counterEl;
          var remaining = limit - inputEl.value.length;
          counter.innerHTML = remaining+ " of " + limit + " remaining";
    }

    $("#examplePhoto").click(function() {
      // Hack - hardcode aspect ratio
      $('#fileInput').click();
    });

    $('#fileInput').change(function(e) {      
      imageUpload($('#preview').get(0));
    });

    // character count
    $("#name").keypress( function() {
      var inputEl = document.getElementById("name");
      var counterEl = document.getElementById("charcount");
      charCountDown(inputEl, counterEl);
    });

    $('#saveme').click( function(e){
      e.preventDefault();
      saveImage();
    });

    $('#show-thankyou-box').click( function(e){
      e.preventDefault();
      saveImage();
      $("#preview, #upload h2, #upload .field, #upload .social-buttons-container, .disclaimer").hide();        
      $("#thank-you").slideDown( 'slow' );   
    });

    // new download function binding directly to element
    document.getElementById("download").addEventListener('click', function(e) {
      link = this;
      link.href = canvasDataSnapshot;
      link.download = 'walmart-test.png';
    }, false);


    $("#share-to-facebook").on('click', function(e) {
      e.preventDefault();
      this.disabled=true;
      var canvas = document.getElementById("canvas"),
      context = canvas.getContext("2d");
      FB.login(function(response) {
         // TODO: Maybe make a try/catch instead and provide a real error...
         if (response.authResponse) {
            var access_token =   FB.getAuthResponse()['accessToken'];
            drawPhoto(context,$('#preview img').data('cropbox').getDataURL("image/png"), postPhoto(context, access_token));
         } else {
            console.log("User cancelled login or did not fully authorize");
         }
      }, {scope: 'publish_actions'});

    });

    $(document).ready(function() {
    // Todo: Add Facebook app ID as a package setting.
      $.ajaxSetup({ cache: true });
      $.getScript('//connect.facebook.net/en_US/all.js', function(){
        FB.init({
          appId: '127053160685288',
        });     
      });

  });