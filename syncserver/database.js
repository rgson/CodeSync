var mysql = require('mysql');
var config = require('./config');
var log = require('./log');

var pool = mysql.createPool(config.database);

module.exports = {
	getSession: getSession,
	fileExists: fileExists,
	insertFile: insertFile,
	updateFile: updateFile,
	deleteFile: deleteFile
}

function getSession(session, callback) {
	pool.getConnection(function(err, connection) {
		var sql = 'SELECT * FROM user_sessions WHERE session = ?';
		var params = [session];
		connection.query(sql, params, function(err, rows) {
			var userid, projectid;
			if (err)
				log.e(err.message);
			if (rows.length > 0) {
				userid = rows[0].user;
				projectid = rows[0].project;
			}
			sql = 'DELETE FROM user_sessions WHERE session = ?';
			connection.query(sql, params, function(err, result) {
				if (err)
					log.e(err.message);
				connection.release();
			});
			callback(userid, projectid);
		});
	});
}

function fileExists(documentid, projectid, callback) {
	var sql = 'SELECT * FROM files'
		+ ' INNER JOIN projects ON files.project = projects.id'
		+ ' WHERE files.id = ? AND projects.id = ?';
	var params = [documentid, projectid];
	pool.query(sql, params, function(err, rows) {
		if (err)
			log.e(err.message);
		callback(!!rows);
	});
}

function insertFile(projectid, path, onSuccess, transactionCallback) {
	pool.getConnection(function(err, connection) {
		if (!err) {
			connection.beginTransaction(function(err) {
				if (!err) {
					var sql = 'INSERT INTO files (project, filepath) VALUES (?, ?)';
					var params = [projectid, path];
					connection.query(sql, params, function(err, result) {
						if (!err) {
							transactionCallback(result.insertId, function(err) {
								if (!err) {
									connection.commit(function(err) {
										if (!err) {
											connection.release();
											onSuccess(result.insertId);
										}
										else rollbackAndRelease(connection, err);
									});
								} else rollbackAndRelease(connection, err);
							});
						} else rollbackAndRelease(connection, err);
					});
				} else log.e(err.message);
			});
		} else log.e(err.message);
	});

	function rollbackAndRelease(connection, err) {
		if (err) log.e(err.message);
		connection.rollback(function (err) {
			if (err) log.e(err.message);
			connection.release();
		});
	}
}

function updateFile(documentid, filepath, callback) {
	var sql = 'UPDATE files SET filepath = ? WHERE id = ?';
	var params = [filepath, documentid];
	pool.query(sql, params, function(err, result) {
		if (err)
			log.e(err.message);
		else
			callback()
	});
}

function deleteFile(documentid, callback) {
	var sql = 'DELETE FROM files WHERE id = ?';
	var params = [documentid];
	pool.query(sql, params, function(err, result) {
		if (err)
			log.e(err.message);
		else
			callback();
	});
}
