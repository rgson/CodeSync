$(function() {

	var projectid = window.location.href.split("/")[3];
	var username = "Me"
	var waitingForResponse = false;
	var firstMessage = 0;
	var lastMessage = 0;
	var messages = $('#chat .body .message');
	var clockInterval = 1000;
	var unreadMessages = false;
	var meSender = false;
	
	$('.time').hide();
	$('.message-notification').hide();

	if (messages.length) {
		firstMessage = $(messages[0]).data('id') | 0;
		lastMessage = $(messages[messages.length - 1]).data('id') | 0;
	}

	$('#chat .head').click(function() {
		$(this).parent().toggleClass('closed');
		messageNotification();
	});

	$('#chat .message-notification').click(function() {
		$(this).parent().toggleClass('closed');
		messageNotification();
	});

	function messageNotification() {
		if (!meSender) {
			if($(this).parent().hasClass('closed')) {
				if (unreadMessages) {
					unreadMessages = false;
					$('.message-notification').show();
				} else {
					$('.message-notification').hide();
				}
			} else {
				//Is closed
				if (unreadMessages) {
					$('.message-notification').show();
		        	$('.time').hide();	
		        	unreadMessages = false;
				} else {
					$('.message-notification').hide();
		        	$('.time').hide();	
		        	unreadMessages = false;
				}
			}
		}

		meSender = false;
	}

	$('#writeMessage').click(function(e) {
		$('.message-notification').hide();
	});

	$('#chat .body').prop({
		scrollTop: $('#chat .body').prop('scrollHeight')
	});

	setInterval(function() { updateClockChat() }, clockInterval);

	//Gets the name of the user, shall not be moved below $('#writeMessage').keypress(function(e).
	getUsername();

	$('#writeMessage').keypress(function(e) {
		//Check if "ENTER" is pressed
		if (e.keyCode==13 && !e.shiftKey) {
			var content = $('#writeMessage').val();
			$('#writeMessage').val('');

			if (!content.trim())
				return false;

			$.ajax({
				type: 'POST',
				url: '/project/' + projectid + '/chat',
				data: {
					'content': content
				}
			});

			//Resetting the cursor in textarea.
			$('#writeMessage').trigger(e);

			$('.message-notification').hide();

			appendThisUserMessage(content);
		}
	});

	function preventDuplicatedMessages(messages) {
		var msgElements = [];
		$.each(messages, function(i, message) {
			if (message.sender != username) {
				msgElements.push(message);
			}
		});

		return msgElements;
	}

	function appendThisUserMessage(content) {
		if (username != "Me") {
			//Update chat with newly created message
			var chatbody = $('#chat .body');
			chatbody.append(
				$('<p>', {'class': 'message', 'data-id': 666})
						.append($('<span>', {'class': 'sender', text: username }))
						.append($('<span>', {'class': 'timestamp', text: createGMTTimestamp() }))
						.append($('<span>', {'class': 'content', text: content })
				)
			);
			//Scrolls to bottom of div, shows last message.
			chatbody.scrollTop(chatbody[0].scrollHeight);
			meSender = true;
		}
	}

	function getUsername() {
		$.ajax({
			type: 'GET',
			url: '/project/' + projectid + '/chat' + '/uName',
			cache: false,
			data: {},
			success: function(response) {
				if (response.length) {
					username = response;
				}
			}
		})
	}

	function createGMTTimestamp() {
		var date = new Date();

		var month = date.getUTCMonth();
		if (month < 10) {
			month = "0" + (date.getUTCMonth() +1);
		} else {
			month = (date.getUTCMonth() +1);
		}

		var day = date.getUTCDate();
		if(day < 10) {
			day = "0" + date.getDate();
		}

		var hour = date.getUTCHours();
		if(hour < 10) {
			hour = "0" + date.getUTCHours();
		}

		var minute = date.getUTCMinutes();
		if(minute < 10) {
			minute = "0" + date.getUTCMinutes();
		}
		
		var formatTimestamp = (" " + date.getUTCFullYear() + "-" + month + "-" + day + " " +
		 	hour + ":" + minute);

		return formatTimestamp;
	}

	function updateClockChat() {
		$('.time').text("(GMT)  " + createGMTTimestamp());
		clockInterval = 30000;
	}

	function formatTimeFromDB(time) {
		if (time) {
			var newFormat = " " + time.substr(0, 16);
			return newFormat;
		}
	}

	//Long polling
	(function getNewMessages() {
		$.ajax({
			type: 'GET',
			url: '/project/' + projectid + '/chat',
			cache: false,
			data: {'after': lastMessage},
			success: function(response) {
				if (response.length) {
					lastMessage = response[response.length - 1].id;
					buildMessages(response);
				}
			},
			complete: function() {
				setTimeout(getNewMessages, 0);
			}
		});
	})();

	function buildMessages(messages, prepend) {
		var msg = preventDuplicatedMessages(messages);
		var i, len;
		var chatbody = $('#chat .body');
		var messageElems = [];
		$.each(msg, function(i, message) {
			messageElems.push(
				$('<p>', {'class': 'message', 'data-id': message.id})
					.append($('<span>', {'class': 'sender', text: message.sender}))
					.append($('<span>', {'class': 'timestamp', text: formatTimeFromDB(message.timestamp.date)}))
					.append($('<span>', {'class': 'content', text: message.content}))
			);
		});

		if (!prepend) {
			for (i = 0, len = messageElems.length; i < len; i++) {
				chatbody.append(messageElems[i]);
			}
		}
		else {
			for (i = messageElems.length - 1; i >= 0; i--) {
				chatbody.prepend(messageElems[i]);
			}
		}

		//Scrolls to bottom of div, shows last message.
		chatbody.scrollTop(chatbody[0].scrollHeight);

		unreadMessages = true;		
		messageNotification();
	}

	$('#chat .body').on('scroll', function() {
		var chatbody = $(this);	
		if (!waitingForResponse && chatbody.scrollTop() === 0) {
			// Get older messages
			waitingForResponse = true;
			$.ajax({
				type: 'GET',
				url: '/project/' + projectid + '/chat',
				cache: false,
				data: {'before': firstMessage},
				success: function(response) {
					if (response.length) {
						firstMessage = response[0].id;
						//buildMessages(response, true);
					}
					else {
						// No older messages, no need to try again
						$('#chat .body').off('scroll');
					}
				},
				complete: function() {
					waitingForResponse = false;
				}
			});
		}
	});
});
