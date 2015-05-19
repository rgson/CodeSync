module.exports = {
	websocket_port: 32358,
	http_port: 32359,
	database: {
		host: 'localhost',
		user: 'root',
		password: 'root',
		database: 'codesync'
	},
	redis: {
		host: 'localhost',
		port: 6379
	},
	file_storage: '/mnt/codesync/',
	pending_downloads: '/mnt/codesync/pending_downloads/'
}
