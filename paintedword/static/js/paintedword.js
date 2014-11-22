//HELPER FUNCTIONS FOR PHOTO UPLOAD WIDGET

$("#uploadDirect").click(function(e) {
    e.preventDefault();
    //clears canvas
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0,0,canvas.width,canvas.height);
    switchStep();

    //draw image to canvas

    drawPhoto(context, $('#preview').attr('src'));

    var canvasForeground = document.getElementById("canvas-foreground"),
        context = canvasForeground.getContext("2d");

    drawFrame(context);
        
});

// This function will presumably switch the context from the 
// uploaded image/cropping area to the canvas with the message
function switchStep() {
    $("#step-1").hide();
    $("#step-2").show();
}


var text = $("#id_message") 
var max_length = text.attr("max-length");
if (text.val().length >= max_length) {
    text.on("keydown", function(event) {
        event.preventDefault();
    });
}

// wrap text on spaces to max width 
// TODO: Update to conform to design when we get it.
function wrapWords(context, text, maxWidth) {
    var words = text.split(' '),
        lines = [],
        line = "";
    if (context.measureText(text).width < maxWidth) {
        return [text];
    }
    while (words.length > 0) {
        if (context.measureText(line + words[0]).width < maxWidth) {
            line += words.shift() + " ";
        } else {
            lines.push(line);
            line = "";
        }
        if (words.length === 0) {
            lines.push(line);
        }
    }
    return lines;
}

// wrap text on linebreaks
function wrapLines(context,text,maxWidth) {
    var sections = text.split('\n'),
        lines = [],
        line = "";
    for (var i = 0; i < sections.length; i++) {
        var wrapped_lines = wrapWords(context,sections[i],maxWidth);
        for (var j = 0; j < wrapped_lines.length; j++) {
            lines.push(wrapped_lines[j]);
        }
    }
    return lines;
}


function drawText(context, options) {
    options = options || {message : $('#id_message').val(), frame_url: frame_url};
    
    //note that frame_url must be in the same host as this script, otherwise we can't do canvas.toDataURL()
    //overlay a transparent rect to draw text on
    context.fillStyle = "rgba(0, 0, 0, 0.50)";
    context.fillRect(0,100,100,100);

    //lay out the message
    if (options.message !== "undefined") {
        var msg_text = options.message;
        var fontSize = 19;
        var textWrapWidth = 180; //for text wrap
        var heightOffset = 100; //starting height
        context.textAlign = "start";
        context.font = fontSize+"px Comic Sans MS";
        context.fillStyle = 'lime'
        
        var lines = wrapLines(context, msg_text, textWrapWidth - parseInt(fontSize,0));
        lines.forEach(function(line, i) {
            context.fillText(line, 40, heightOffset + ((i + 1) * parseInt(fontSize,0)));
        });
    }
}

//overlay frame layer onto image
//we can also update to just overlay logo and build frame ourselves 
//need to update styles and positions eventually
function drawFrame(context,callback) {
    if (frame_url !== "undefined") {
        var logo = new Image();
        logo.src = frame_url;
        logo.onload = function() {
            context.fillStyle = "#BF2E1A";
            context.fillRect(0,0,logo.width+40,logo.height+20);
            context.drawImage(logo,20,10,logo.width,logo.height);
        }
    }
}

//draw photo to canvas
function drawPhoto(context,image_src, callback) {
    var img = new Image();
    img.src = image_src;
    img.onload = function() {
        context.drawImage(img, 0, 0, 360, 360);
        if (typeof callback !== "undefined") {
            callback(context);
        }
    };
}

//redraw when we add text and such
function redraw(){
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

    drawPhoto(context,$('#preview').attr('src'), drawText);
}

//update image on text fields change
$("#id_message").change(redraw);

//Callbacks
function err(e) { if (window.console && console.error) console.error(e) }

function fileLoadCallback(file) {
    var reader = new FileReader();
    reader.onload = (function(file) { 
        //Cropping magic - Will update and explain later.
        return function(e) {
            var image = new Image();
            image.src = e.target.result;
            image.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = image.height * (300 / image.width);
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                
                $('.example-photo img').replaceWith(['<img src="', canvas.toDataURL(), '"/>'].join(''));

                var img = $('.example-photo img')[0];
                var canvas = document.createElement('canvas');

                $('.example-photo img').Jcrop({ 
                    bgColor: 'black',
                    bgOpacity: .4,
                    setSelect: [0, 0, 100, 100],
                    aspectRatio: 1, 
                    onSelect: cropImage,
                    onChange: cropImage
                });

                function cropImage(selection) {
                    canvas.width = canvas.height = 360;

                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, selection.x, selection.y, selection.w, selection.h, 0, 0, canvas.width, canvas.height);

                    $('#preview').attr('src', canvas.toDataURL())
                }
            }
        }
    })(file);   
    reader.readAsDataURL(file);
}

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

// Event for when user loads a file
// Not doing any fancy file drop this time around
$('#id_photo').change(function(e) {
    var file = e.target.files[0];
    fileLoadCallback(file);
})

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

$(document).ready(function() {

var text = $("#id_message"),
    max_length = text.attr("maxlength"),
    label = $('label[for=id_message] span');

//initial
label.html(max_length - text.val().length)

//change
$('#id_message').keyup(function(){
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




