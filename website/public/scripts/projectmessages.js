//Global vaiables
var lastMsg = 0;

$(document).ready(function()  {

	$('#writeMessage').keypress(function(e) {
		//Check if "ENTER" is pressed
		if (e.keyCode==13 && !e.shiftKey) {
			//Send message.
			var content = $('#writeMessage').val();
			var projectid = window.location.href.split("/")[3];

			//Erase information in textarea.
			$('#writeMessage').val('');

			//if message is empty
			if (content == null || content == "" || ($.trim(content).length === 0)) {
				return false;
			}

			$.ajax({
				url: '/project/' + projectid + '/chat',
				data: {
					'content' : content,
					'project' : projectid
				},
				cache: false,
				type: 'POST'
			});

			//Resetting the cursor in textarea.
			$('#writeMessage').trigger(e);
		}
	});

	//Ordinary polling with recursion.
	(function getMessages() {
		var projectid = window.location.href.split("/")[3];

		setInterval(function() {
			$.ajax({
				url: '/project/' + projectid + '/chat',
				type: 'GET',
				cache: false,
				data: {'last_message' : window.lastMsg },
				success: function(responseObj) {
					if (responseObj.length > 0) {
						window.lastMsg = getLastDateTime(responseObj);
						buildMessageTable(responseObj);
					}
				getMessages();
				}, dataType: "json"
			});
		}, 2000);
	}) ();

	//Long  polling
	/*(function getMessages() {
		var projectid = window.location.href.split("/")[3];
	   setInterval(function() {
	       $.ajax({
	       url: '/project/' + projectid + '/chat',
	       type: 'GET',
	       cache: false,
	       data: {'last_message' : window.lastId },
	        success: function(responseObj) {
	           if (responseObj.length > 0) {
						window.lastId = getLastId(responseObj);
						buildMessageTable(responseObj)
					}
	       }, dataType: "json",
	       	  complete: getMessages() });
	    }, 2000);
	})();*/

	function buildMessageTable(messages) {
		$.each(messages, function(i, msg) {
			$('.body').append(
	    	 	$('<div/>', {'class': 'message'}).append(
		            $('<span/>', {'class': 'sender', text: msg[0]})
	            ).append(
	            	$('<span/>', {'class': 'content', text: msg[1].content}))
	    	);
		});
		//Scrolls to bottom of div, shows last message.
		$('.body').scrollTop($('.body')[0].scrollHeight);
	}

	function getLastDateTime(responseObj) {
		return responseObj[responseObj.length -1][1].created_at;
	}

});
