$(function() {

	var lastFocusedWorkspace;
	var workspaces = {};
	var tabsLocation = {};

	window.Tabs = {
		open: function(id, title) {
			var keys = Object.keys(workspaces);
			if (!id) throw new Error('Must specify a file ID');
			if (!keys.length) throw new Error('No workspaces found');
			if (!tabsLocation[id])
				workspaces[lastFocusedWorkspace || keys[0]].add(new Tab(id, title));
			workspaces[tabsLocation[id]].activate(id);
		}
	};

	$('.workspace').each(function(i, elem) {
		var workspace = new Workspace(elem);
		workspaces[workspace.id] = workspace;
	});

	$(document).on('mousedown', '.tab', function(event) {
		var id = $(this).data('id');
		var workspace = workspaces[tabsLocation[id]];
		switch (event.which) {
			case 1:
				workspace.activate(id);
				event.preventDefault();
				break;
			case 2:
				workspace.remove(id);
				event.preventDefault();
				break;
		}
	});

	$(document).on('click', '.tab .close', function(event) {
		var id = $(this).parent().data('id');
		var workspace = workspaces[tabsLocation[id]];
		workspace.remove(id);
		event.preventDefault();
	});

	SyncClient.on('move', function(args) {
		var title = args.path.split('/');
		title = title[title.length - 1];
		if (tabsLocation[args.doc])
			workspaces[tabsLocation[args.doc]].rename(args.doc, title);
	});

	SyncClient.on('delete', function(args) {
		if (tabsLocation[args.doc])
			workspaces[tabsLocation[args.doc]].remove(args.doc);
	});

	function Workspace(element) {
		var that = this;
		var element = $(element);
		var tabContainer = element.children('.tabs');
		var tabs = {};
		var activeTab = undefined;

		this.id = element.attr('id');
		this.editor = CodeMirror.fromTextArea(element.children('.editor')[0], {
			mode: 'javascript',
			theme: 'codesync',
			lineNumbers: true,
			lineWrapping: true,
			indentWithTabs: true,
			tabSize: 2
		});

		this.editor.on('focus', function() {
			lastFocusedWorkspace = that.id;
		});

		this.activate = function(id) {
			if (id !== activeTab) {
				if (tabs[activeTab])
					tabs[activeTab].deactivate();
				tabs[id].activate();
				activeTab = id;
			}
		}

		this.add = function(tab) {
			if (!tabs[tab.id]) {
				tabs[tab.id] = tab;
				tab.setWorkspace(that);
				tabsLocation[tab.id] = that.id;
				tab.element.appendTo(tabContainer);
			}
		}

		this.remove = function(id) {
			var tab = tabs[id];
			if (tab !== undefined) {
				if (id === activeTab) {
					tab.deactivate();
					activeTab = undefined;
				}
				tab.setWorkspace(undefined);
				tabsLocation[id] = undefined;
				tab.element.detach();
				tab.close();
				delete tabs[id];
				if (activeTab === undefined) {
					var keys = Object.keys(tabs);
					if (keys.length) {
						that.activate(keys[0]);
					}
				}
			}
		}

		this.rename = function(id, title) {
			var tab = tabs[id];
			if (tab)
				tab.rename(title);
		}
	}

	function Tab(id, title) {
		var that = this;
		var active = false;
		var workspace;
		var content = '';

		this.id = id;
		this.title = title;
		this.element =
			$('<div>', {'class': 'tab', 'data-id': id})
				.append($('<span>', {'class': 'title', 'text': that.title}))
				.append($('<i>', {'class': 'glyphicon glyphicon-remove close'}));

		this.activate = function() {
			if (!active) {
				that.element.addClass('active');
				active = true;
				workspace.editor.setValue(content);
			}
		}

		this.deactivate = function() {
			if (active) {
				that.element.removeClass('active');
				active = false;
				content = workspace.editor.getValue();
				workspace.editor.setValue('')
			}
		}

		this.setWorkspace = function(value) {
			that.deactivate();
			workspace = value;
		}

		this.close = function() {
			SyncClient.do('close', {doc: that.id});
		}

		this.rename = function(name) {
			that.title = name;
			that.element.children('.title').text(name);
		}

		SyncClient.do('open', {
			doc: id,
			get: function() {
				if (workspace && active)
					return workspace.editor.getValue();
				return content;
			},
			set: function(value) {
				var cursor;
				if (workspace && active) {
					cursor = workspace.editor.getCursor('head');
					workspace.editor.setValue(value);
					workspace.editor.setCursor(cursor)
				}
				else {
					content = value;
				}
			}
		});
	}

});
