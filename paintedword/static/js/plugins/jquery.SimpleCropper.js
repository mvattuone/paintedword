/* 
    Author     : Tomaz Dragar
    Mail       : <tomaz@dragar.net>
    Homepage   : http://www.dragar.net
*/

(function($) {

  $.fn.simpleCropper = function() {

    var image_dimension_x = 600;
    var image_dimension_y = 600;
    var scaled_width = 0;
    var scaled_height = 0;
    var x1 = 0;
    var y1 = 0;
    var x2 = 0;
    var y2 = 0;
    var current_image = null;
    var aspX = 1;
    var aspY = 1;
    var ias = null;
    var jcrop_api;
    var bottom_html = "<input type='file' id='fileInput' name='files[]'/><canvas id='myCanvas' style='display:none;'></canvas><div id='modal'></div><div id='preview'><div class='buttons'><div class='cancel'></div><div class='ok'></div></div></div>";
    $('body').append(bottom_html);

    //add click to element
    this.click(function() {
      aspX = $(this).width();
      aspY = $(this).height();
      $('#fileInput').click();
    });

    $(document).ready(function() {
      //capture selected filename
      $('#fileInput').change(function(click) {
        imageUpload($('#preview').get(0));
        // Reset input value
        $(this).val("");
      });

      //ok listener
      $('.ok').click(function() {
        preview();
        $('#preview').delay(100).hide();
        $('#modal').hide();
        jcrop_api.destroy();
        reset();
      });

      //cancel listener
      $('.cancel').click(function(event) {
        $('#preview').delay(100).hide();
        $('#modal').hide();
        jcrop_api.destroy();
        reset();
      });
    });

    //update image on text fields change
$("#id_message").change(redraw);


    function reset() {
      scaled_width = 0;
      scaled_height = 0;
      x1 = 0;
      y1 = 0;
      x2 = 0;
      y2 = 0;
      current_image = null;
      aspX = 1;
      aspY = 1;
    }

    function imageUpload(dropbox) {
      var file = $("#fileInput").get(0).files[0];
      //var file = document.getElementById('fileInput').files[0];
      var imageType = /image.*/;

      if (file.type.match(imageType)) {
        var reader = new FileReader();

        reader.onload = function(e) {
          // Clear the current image.
          $('#photo').remove();

          // Create a new image with image crop functionality
          current_image = new Image();
          current_image.src = reader.result;
          current_image.id = "photo";
          current_image.style['maxWidth'] = image_dimension_x + 'px';
          current_image.style['maxHeight'] = image_dimension_y + 'px';
          current_image.onload = function() {
            // Calculate scaled image dimensions
            if (current_image.width > image_dimension_x || current_image.height > image_dimension_y) {
              if (current_image.width > current_image.height) {
                scaled_width = image_dimension_x;
                scaled_height = image_dimension_x * current_image.height / current_image.width;
              }
              if (current_image.width < current_image.height) {
                scaled_height = image_dimension_y;
                scaled_width = image_dimension_y * current_image.width / current_image.height;
              }
              if (current_image.width == current_image.height) {
                scaled_width = image_dimension_x;
                scaled_height = image_dimension_y;
              }
            }
            else {
              scaled_width = current_image.width;
              scaled_height = current_image.height;
            }


            // Position the modal div to the center of the screen
            $('#modal').css('display', 'block');
            var window_width = $(window).width() / 2 - scaled_width / 2 + "px";
            var window_height = $(window).height() / 2 - scaled_height / 2 + "px";

            // Show image in modal view
            $("#preview").css("top", window_height);
            $("#preview").css("left", window_width);
            $('#preview').show(500);


            // Calculate selection rect
            var selection_width = 0;
            var selection_height = 0;

            var max_x = Math.floor(scaled_height * aspX / aspY);
            var max_y = Math.floor(scaled_width * aspY / aspX);


            if (max_x > scaled_width) {
              selection_width = scaled_width;
              selection_height = max_y;
            }
            else {
              selection_width = max_x;
              selection_height = scaled_height;
            }

            ias = $(this).Jcrop({
              onSelect: showCoords,
              onChange: showCoords,
              bgColor: '#747474',
              bgOpacity: .4,
              aspectRatio: aspX / aspY,
              setSelect: [0, 0, selection_width, selection_height]
            }, function() {
              jcrop_api = this;
            });
          }

          // Add image to dropbox element
          dropbox.appendChild(current_image);
        }
        reader.readAsDataURL(file);

      } else {
        dropbox.innerHTML = "File not supported!";
      }
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

    function showCoords(c) {
      x1 = c.x;
      y1 = c.y;
      x2 = c.x2;
      y2 = c.y2;
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

//redraw when we add text and such
function redraw(){
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

    drawPhoto(context,$('#preview img').attr('src'), drawText);
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


function switchStep(current, next) {
    $('[data-step="' + current + '"]').hide();
    $('[data-step="' + next + '"]').show();
}

    function preview() {

      // Set canvas
      var canvas = document.getElementById('canvas');
      var context = canvas.getContext('2d');

      // Delete previous image on canvas
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Set selection width and height
      var sw = x2 - x1;
      var sh = y2 - y1;

      
      // Set image original width and height
      var imgWidth = current_image.naturalWidth;
      var imgHeight = current_image.naturalHeight;

      // Set selection koeficient
      var kw = imgWidth / $("#preview").width();
      var kh = imgHeight / $("#preview").height();

      // Set canvas width and height and draw selection on it
      canvas.width = aspX;
      canvas.height = aspY;
      context.drawImage(current_image, (x1 * kw), (y1 * kh), (sw * kw), (sh * kh), 0, 0, aspX, aspY);

      // Convert canvas image to normal img
      var dataUrl = canvas.toDataURL();
      var imageFoo = document.createElement('img');
      imageFoo.src = dataUrl;

      // Append it to the body element
      $('#preview').delay(100).hide();
      $('#modal').hide();
    
      switchStep(1,2);
      drawPhoto(context, $('#preview img').attr('src'), drawFrame);

    }

    $(window).resize(function() {
      // Position the modal div to the center of the screen
      var window_width = $(window).width() / 2 - scaled_width / 2 + "px";
      var window_height = $(window).height() / 2 - scaled_height / 2 + "px";

      // Show image in modal view
      $("#preview").css("top", window_height);
      $("#preview").css("left", window_width);
    });
  }
}(jQuery));
