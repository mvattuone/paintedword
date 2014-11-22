//HELPER FUNCTIONS FOR PHOTO UPLOAD WIDGET

function switchStep() {
    $("#step-1").hide();
    $("#step-2").show();
}

function stepBack() {
    redraw(); //remove current photo
    $("#step-2").hide();
    $("#step-1").show();
}

//Character limit on TextArea
// var text = $("#id_message") 
// var max_length = text.attr("max-length");
// if (text.val().length >= max_length) {
//     text.on("keydown", function(event) {
//         event.preventDefault();
//     });
// }

//wrap text on spaces to max width
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

//wrap text on linebreaks
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

//redraw functions for text
function drawText(context, options) {
    var citystate = window.citystate;
    options = options || {name: $('#id_name').val(),
                          location: citystate,
                          message : $('#id_message').val(),
                          logo_url: logo_url};
    //note that logo_url must be in the same host as this script, otherwise we can't do canvas.toDataURL()
    //overlay a transparent rect to draw text on
    context.fillStyle = "rgba(0, 0, 0, 0.50)";
    context.fillRect(0,380,640,100);

    //name & location
    if (options === undefined) {
        var name_text = "";
    } else if (options.location === undefined) {
        var name_text = options.name;
    } else {
        var name_text = options.name+" - "+options.location;        
    }
   
    context.fillStyle = "rgba(255, 255, 255, 1)";
    context.font = "bold 20px museo-slab";
    context.textAlign = "end";
    context.fillText(name_text, 630, 470);
    //message
    if (options.message !== "undefined") {
        var msg_text = options.message;
        var fontSize = 19;
        var textWrapWidth = 560; //for text wrap
        var heightOffset = 390; //starting height
        context.textAlign = "start";
        context.font = fontSize+"px museo-slab";
        
        var lines = wrapLines(context, msg_text, textWrapWidth - parseInt(fontSize,0));
        lines.forEach(function(line, i) {
            context.fillText(line, 40, heightOffset + ((i + 1) * parseInt(fontSize,0)));
        });
    }


        if (options.logo_url !== "undefined") {
            var logo = new Image();
            logo.src = options.logo_url;
            logo.onload = function() {
                context.fillStyle = "#BF2E1A";
                context.fillRect(0,0,logo.width+40,logo.height+20);
                context.drawImage(logo,20,10,logo.width,logo.height);
            }
        }
    }

function drawPhoto(context,image_src, callback) {
    var img = new Image();
    img.src = image_src;
    img.onload = function() {
        context.drawImage(img, 0, 0, 640, 480);

        if (typeof callback !== "undefined") {
            callback(context);
        }
    };
}

function redraw(){
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

    drawPhoto(context,$('#id_raw_photo_url').val(),drawText);
}

//update image on text fields change
$("#id_message").change(redraw);

//start over link
$("a#startOver").click(function(event) {
    event.preventDefault();
    stepBack();
});

//Callbacks
function err(e) { if (window.console && console.error) console.error(e) }

function fileLoadCallback(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        console.log(e);
        $("#preview img").attr('src', e.target.result);    
        $('#image_input').html(['<img src="', canvas.toDataURL(), '"/>'].join(''));
        var img = $('#image_input img')[0];
        setTimeout(function() {
            $('#image_input img').Jcrop({
                bgColor: 'black',
                bgOpacity: .6,
                setSelect: [0, 0, 100, 100],
                aspectRatio: 1,
            });
        }, 3000)
    }
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

$('#id_photo').change(function(e) {
    var file = e.target.files[0];
    fileLoadCallback(file);
})

$("#uploadDirect").click(function(e) {
        e.preventDefault();
        data = new FormData();
        data.append('photo', $("#id_photo")[0].files[0]);
        $.ajax({
            type: 'POST',
            url:"upload_raw_photo",
            processData:false,
            contentType: false,
            dataType: false,
            data: data,
        error: function(data) {
            alert('Please select a photo to upload before submitting.')
        },
        success: function(data) {
            var data = $.parseJSON(data);
            //clears canvas
            var canvas = document.getElementById("canvas");
            var context = canvas.getContext("2d");
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0,0,canvas.width,canvas.height);
            switchStep();
            $('#id_raw_photo_pk').val(data.raw_photo_pk);
            $('#id_raw_photo_url').val(data.file_url);
            //draw image to canvas
            var canvas = document.getElementById("canvas");
            var context = canvas.getContext("2d");
            drawPhoto(context,data.file_url, uploadCallback(data));
        }
    });
});

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
        label.css("color", "white");
   }
});
});




