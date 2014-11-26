
function postPhoto(context) {

  $('input').removeClass('error');
  $('label').removeClass('error');
  var base64img = context.canvas.toDataURL();
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
              FB.login(function(response) {
                 if (response.authResponse) {
                    var access_token =   FB.getAuthResponse()['accessToken'];
                    PostImageToFacebook(access_token);
                 } else {
                   //User cancelled login or did not fully authorize
                 }
              }, {scope: 'publish_actions'});
              $("#upload h2, #upload .field, #upload .social-buttons-container, .disclaimer").hide();        
              $("#thank-you").slideDown( 'slow' );   
    }
  });
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

  function switchStep(current, next) {
    $('[data-step="' + current + '"]').hide();
    $('[data-step="' + next + '"]').show();
  }

//redraw when we add text and such
function redraw() {
  var canvas = document.getElementById("canvas"),
  context = canvas.getContext("2d");
  drawPhoto(context,$('#preview img').attr('src'), drawFrame);
}

function initCropper() {
  $('#preview img').cropbox({
    "width":390,
    "height":263
  });

}

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

function downloadCanvas(link, canvasId, filename) {
  link.href = document.getElementById(canvasId).toDataURL();
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
      //var file = document.getElementById('fileInput').files[0];
      var imageType = /image.*/;

      if (file.type.match(imageType)) {
        var reader = new FileReader();

        reader.onload = function(e) {
          switchStep(1,2);

          // Create a new image with image crop functionality
          current_image = new Image();
          current_image.src = reader.result;
          current_image.id = "photo";

          // Add image to dropbox element
          dropbox.appendChild(current_image);
          initCropper();
          context = document.getElementById("canvas").getContext("2d");
          drawFrame(context);
        }
        reader.readAsDataURL(file);

      } else {
        dropbox.innerHTML = "File not supported!";
      }
    }

    $("#name").change(function() {
      var canvas = document.getElementById("canvas"),
      context = canvas.getContext("2d");
      drawFrame(context)
    });

    $("#share-to-facebook").on('click', function(e) {
      e.preventDefault();
      this.disabled=true;
      var canvas = document.getElementById("canvas"),
      context = canvas.getContext("2d");
      drawPhoto(context,$('#preview img').data('cropbox').getDataURL(), postPhoto);
    });

    $("#examplePhoto").click(function() {
      // Hack - hardcode aspect ratio
      $('#fileInput').click();
    });

    $('#fileInput').change(function(click) {
      imageUpload($('#preview').get(0));
      // Reset input value
      $(this).val("");
    });

    $("#download").on('click', function(e) {
      e.preventDefault();
      downloadCanvas(this, 'canvas', 'walmart-coc.png');
    })

    $(document).ready(function() {
    // Todo: Add Facebook app ID as a package setting.
      $.ajaxSetup({ cache: true });
      $.getScript('//connect.facebook.net/en_US/all.js', function(){
        FB.init({
          appId: '127053160685288',
        });     
      });

  });


// viewport = document.querySelector("meta[name=viewport]");
// viewport.setAttribute('content', 'width=440, initial-scale=.6, maximum-scale=1, user-scalable=0');


// var hammertime = new Hammer(document.getElementById("photo"));

// hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });

// hammertime.on('pan', function(ev) {
//     console.log(ev);
// });


