// Post a BASE64 Encoded PNG Image to facebook
function PostImageToFacebook(authToken) {
    var canvas = document.getElementById("canvas");
    var imageData = canvas.toDataURL("image/png");
    var shareMessage = $('#modal_message textarea').val();
    try {
        blob = dataURItoBlob(imageData);
    } catch (e) {
        console.log(e);
    }
    var fd = new FormData();
    fd.append("access_token", authToken);
    fd.append("source", blob);
    fd.append("message", shareMessage);
    try {
        $.ajax({
            url: "https://graph.facebook.com/me/photos?access_token=" + authToken,
            type: "POST",
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            success: function (data) {
                console.log("success " + data);
            },
            error: function (shr, status, data) {
                console.log("error " + data + " Status " + shr.status);
            },
            complete: function () {
                console.log("Posted to facebook");
                // show thank you panel after share
                // $("#thank-you").show();
            }
        });

    } catch (e) {
        console.log(e);
    }
}

// Convert a data URI to blob
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {
        type: 'image/png'
    });
}