//HELPER FUNCTIONS FOR PHOTO UPLOAD WIDGET


//Callbacks
function err(e) { if (window.console && console.error) console.error(e) }

//Called after file is succesfully uploaded and drawn to the canvas, 
//Allows for hooks to manipulate DOM (show share buttons, form ,etc.)
function uploadCallback(response) {
    if ( window.onUploadSuccess ) {
        try {
            var res = onUploadSuccess(response);
            if ( typeof(res) === typeof(false) && !res ) return false;
        } catch(e) { err(e) };
    }
};

//Need to update this to submit photo to the DB and trigger share context
$("#sendForm").click(function(e) {
    e.preventDefault();
    this.disabled=true;
    
    var canvas = document.getElementById("canvas");
    var dataURL = canvas.toDataURL();
    $('#id_photo_dataurl').val(dataURL);
    $("#sendForm").val("");
    $('input').removeClass('error');
    $('label').removeClass('error');

    $.ajax({
        type: 'POST',
        url:"submit",
        contentType:'multipart/form-data',
        data: {
            captioned_photo: dataURL,
            name:$('#id_name').val(),
            zip_code: $('#id_zip_code').val(),
            email: $('#id_email').val(),
            message: $('#id_message').val(),
            raw_photo_pk: $('#id_raw_photo_pk').val(),
        },
       error: function(jqXHR, textStatus) {
            $("#sendForm").val("Submit");
            var errors = $.parseJSON(jqXHR.responseText);
            $('input#id_'+errors.field).addClass('error');
            $('label[for="id_'+errors.field+'"]').addClass('error');
            $("#sendForm").removeAttr("disabled")
        },
        success: function(jqXHR, textStatus, errorThrown) {
            $('#upload').hide();
            $('#black_overlay').fadeOut();
            $('#start_upload').html("<p>Thanks for sharing your voice!</p>")
            $("#sendForm").removeAttr("disabled")
            $("#sendForm").val("Submit");
        }
    });  
});

$("#share-to-facebook").on('click', function() {
    FB.login(function(response) {
       if (response.authResponse) {
         var access_token =   FB.getAuthResponse()['accessToken'];
         console.log('Access Token = '+ access_token);
          PostImageToFacebook(access_token);
       } else {
         console.log('User cancelled login or did not fully authorize.');
       }
    }, {scope: 'publish_actions'});
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
      

    var text = $("#id_message"),
        max_length = text.attr("maxlength"),
        label = $('label[for=id_message] span');

    //initial
    label.html(max_length - text.val().length)

    if (text.val().length >= max_length) {
        text.on("keydown", function(event) {
            event.preventDefault();
        });
    }

    //change
    text.keyup(function(){
       label.html(max_length - this.value.length)
       //change color
       var charCount = text.val().length
       switch(true)
       {
       case (charCount >=130):
            label.css("color", "red");
            break;
       default:
            label.css("color", "black");
       }
    });
});




