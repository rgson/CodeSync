
//Send message.
$('#sendMessage').click(function() {
	var messageContent = $('selected').data('value');
	var projectid = window.location.href.split("/")[3];

	//if message is empty
	if (messageContent == null || messageContent == '') {
		return false;
	}

	$.ajax({
		url: '/project/' + projectid + '/chat',
		data: {
			'messageContent' : messageContent
		};
		cache: false,
		type 'POST',
		success: function(response) {
			if (response == 'invalid') {
				window.alert("message could not be added to conversation, please try again.");
			}
			else {
				buildMessageTable(response ,'projectid')
			}
		}

	});
})

function buildMessageTable(response) {
	$('#showProjectConversation').slice(1, 4);

	var messages = $.parseJSON(response);

	$.each(messages, function(i, message) {
		$('#showwProjectConversation').append("<tr><td>" + message.sender + "</td>" +
			"<td>" + message.created_at "</td>" + "<td>" + message.content + "</td></tr>");
	})
}
