
function postPhoto() {

    var canvas = document.getElementById("canvas"),
        dataURL = canvas.toDataURL();

    $('input').removeClass('error');
    $('label').removeClass('error');

    $.ajax({
        type: 'POST',
        url: 'submit',
        contentType: false,
        data: {
            captioned_photo: dataURL,
            name:$('#name').val(),
        },
        error: function(jqXHR, textStatus) {
            var errors = $.parseJSON(jqXHR.responseText);
            $('input#'+errors.field).addClass('error');
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
        }
    });
}

function drawFrame(context) {
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

//draw photo to canvas
function drawPhoto(context,image_src, callback) {
    var img = new Image();
    img.src = image_src;
    img.onload = function() {
        context.drawImage(img, 0, 91, 390, 263);
        if (typeof callback !== "undefined") {
            callback(context);
        }
    };
}

$("#name").change(function() {
    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d");
    drawFrame(context)
});

$("#share-to-facebook").on('click', function() {
    this.disabled=true;
    postPhoto();
});
      

$(document).ready(function() {
    // Todo: Add Facebook app ID as a package setting.
    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/all.js', function(){
        FB.init({
          appId: '319448898248693',
        });     
    });

    // Init Simple Cropper
    $('#examplePhoto').simpleCropper();
});




