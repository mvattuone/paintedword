// Modal Popups

// Load dialog on click
$('#test-share-modal').click(function (e) {

	console.log("supporters clicked");
	// $("#supporters-popover").modal();

	e.preventDefault();

	// $.modal("<div><h1>SimpleModal</h1></div>");

	$('#share-modal').modal({onOpen: function (dialog) {

	dialog.overlay.fadeIn('slow', function () {
		// dialog.data.hide();
		dialog.container.fadeIn('slow', function () {
			dialog.data.fadeIn('slow');	 
		});
	});
	
	// setTimeout(function() {
	// 	dialog.data.fadeOut('slow', function () {
	// 			dialog.container.fadeOut('slow', function () {
	// 				dialog.overlay.fadeOut('slow', function () {
	// 					$.modal.close();
	// 				});
	// 			});
	// 	});
	// 	
	// }, 6000);	

	}, overlayClose:true});

});