// Modal Popups

// Load dialog on click
$('#test-share-modal').click(function (e) {

	console.log("supporters clicked");
	// $("#supporters-popover").modal();

	e.preventDefault();

	// $.modal("<div><h1>SimpleModal</h1></div>");

	$('#share-modal').modal({overlayClose:false});

	$('#share-modal').modal({
		onOpen: function (dialog) {

			dialog.overlay.fadeIn('slow', function () {
				// dialog.data.hide();
				dialog.container.fadeIn('slow', function () {
					dialog.data.fadeIn('slow');	 
				});
			});
			
			$('#modal_message textarea').append('I stand with the #walmartstrikers');
			setTimeout(function(){
				$('#modal_message textarea').focus();
			}, 1000);	

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

		}
	});

});