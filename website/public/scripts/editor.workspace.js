$(function() {

	var hoveringWorkspace;
	var workspaces = {};
	var tabsLocation = {};

	window.Tabs = {
		open: function(id, title) {
			var keys = Object.keys(workspaces);
			if (!id) throw new Error('Must specify a file ID');
			if (!keys.length) throw new Error('No workspaces found');
			if (!tabsLocation[id]) {
				workspaces[keys[0]].add(new Tab(id, title));
			}
			workspaces[tabsLocation[id]].activate(id);
		}
	};

	$('.workspace').each(function(i, elem) {
		var workspace = new Workspace(elem);
		workspaces[workspace.id] = workspace;
	});

	$('.workspace').hover(
		function enter() {
			hoveringWorkspace = $(this).attr('id');
		},
		function exit() {
			hoveringWorkspace = undefined;
		}
	);

	$('.tab').click(function() {
		var id = $(this).data('id');
		workspaces[tabsLocation[id]].activate(id);
	})

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
			indentWithTabs: true,
			tabSize: 2
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

		this.remove = function(tab) {
			if (tab.id === activeTab) {
				tab.deactivate();
				activeTab = undefined;
			}
			tab.setWorkspace(undefined);
			tabsLocation[tab.id] = undefined;
			tab.element.detach();
			delete tabs[tab.id];
		}
	}

	function Tab(id, title) {
		var that = this;
		var active = false;
		var workspace;
		var content;

		this.id = id;
		this.element = $('<div>', {'class': 'tab', 'data-id': id, 'text': title});

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
			}
		}

		this.setWorkspace = function(value) {
			that.deactivate();
			workspace = value;
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
