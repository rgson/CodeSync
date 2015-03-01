var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:32358/');

ws.on('open', function open() {
	console.log('connected');
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function(input) {
		ws.send(getOutput(input));
	});
});
ws.on('close', function close() {
	console.log('disconnected');
});
ws.on('message', function message(data, flags) {
	console.log('>> ' + data);
});

function getOutput(input) {
	switch (input) {

		case 'auth 1\n':
		return '{"type":"user.auth","session":"123"}';

		case 'auth 2\n':
		return '{"type":"user.auth","session":"321"}';

		case 'auth\n':
		return '{"type":"user.auth","session":"-1"}';

		case 'open 1\n':
		return '{"type":"file.open","doc":"1"}';

		case 'close 1\n':
		return '{"type":"file.close","doc":"1"}';

		default:
		return input;

	}
}
