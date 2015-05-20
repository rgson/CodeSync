$(function() {

	CodeMirror.modeURL = '/libs/codemirror/mode/%N.js';

	var lastFocusedWorkspace;
	var workspaces = {};
	var tabsLocation = {};
	var draggingTab;
	var pressedTab;
	var pressedPoint;

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

	$(document).on('click', '.tab', function(event) {
		var id = $(this).data('id');
		activateTab(id);
		event.preventDefault();
	});

	$(document).on('click', '.tab .close', function(event) {
		var id = $(this).parent().data('id');
		closeTab(id);
		event.preventDefault();
		event.stopPropagation();
	});

	$(document).on('mousedown', '.tab', function(event) {
		var id = $(this).data('id');
		var workspace = workspaces[tabsLocation[id]];
		switch (event.which) {
			case 1:
				pressTab(id, new Point(event.pageX, event.pageY));
				event.preventDefault();
				break;
			case 2:
				closeTab(id);
				event.preventDefault();
				break;
		}
	});

	$(document).on('mouseup', '.tab', function(event) {
		releaseTab(new Point(event.pageX, event.pageY));
	});

	$(document).on('mousemove', '.workspace', function(event) {
		if (pressedTab)
			dragTab(new Point(event.pageX, event.pageY));
	});

	SyncClient.on('move', function(args) {
		if (tabsLocation[args.doc])
			renameTab(args.doc, args.path);
	});

	SyncClient.on('delete', function(args) {
		if (tabsLocation[args.doc])
			closeTab(args.doc);
	});

	function activateTab(id) {
		workspaces[tabsLocation[id]].activate(id);
	}

	function closeTab(id) {
		workspaces[tabsLocation[id]].remove(id);
	}

	function pressTab(id, point) {
		pressedTab = id;
		pressedPoint = point;
	}

	function dragTab(point) {
		var minDragDistance = 50;
		if (pressedTab && !draggingTab) {
			if (point.distance(pressedPoint) > minDragDistance) {
				draggingTab = workspaces[tabsLocation[pressedTab]].lift(pressedTab);
			}
		}
		if (draggingTab) {
			draggingTab.lift(point);
		}
	}

	function releaseTab(point) {
		var pos, keys, i, workspace;
		if (draggingTab) {
			pos = {x: event.pageX, y: event.pageY};
			keys = Object.keys(workspaces);
			for (i = keys.length - 1; i >= 0; i--) {
				workspace = workspaces[keys[i]];
				if (workspace.at(pos)) {
					workspace.add(draggingTab);
					workspace.activate(draggingTab.id);
					break;
				}
			}
			draggingTab.drop();
			draggingTab = undefined;
		}
		pressedTab = pressedPosition = undefined
	}

	function renameTab(id, path) {
		var title = path.split('/');
		title = title[title.length - 1];
		workspaces[tabsLocation[id]].rename(id, title);
	}

	function Workspace(element) {
		var that = this;
		var element = $(element);
		var tabContainer = element.children('.tabs');
		var tabs = {};
		var activeTab = undefined;
		var blankDocument = new CodeMirror.Doc('No file opened.');
		var editor = CodeMirror.fromTextArea(element.children('.editor')[0], {
			theme: 'codesync',
			lineNumbers: true,
			lineWrapping: true,
			indentWithTabs: true,
			tabSize: 2,
			readOnly: 'nocursor'
		});

		this.id = element.attr('id');

		editor.on('focus', function() {
			lastFocusedWorkspace = that.id;
		});

		editor.swapDoc(blankDocument);

		this.activate = function(id) {
			if (id !== activeTab) {
				if (tabs[activeTab])
					tabs[activeTab].deactivate();
				tabs[id].activate();
				activeTab = id;
				editor.swapDoc(tabs[id].cmDocument);
				editor.setOption('readOnly', false);
			}
		}

		this.deactivate = function() {
			if (activeTab) {
				tabs[activeTab].deactivate();
				activeTab = undefined;
				editor.swapDoc(blankDocument);
				editor.setOption('readOnly', 'nocursor');
			}
		}

		this.add = function(tab) {
			if (!tabs[tab.id]) {
				tabs[tab.id] = tab;
				tabsLocation[tab.id] = this.id;
				tab.attach(tabContainer);
				tab.open();
			}
		}

		this.remove = function(id) {
			var tab = this.lift(id);
			tab.detach();
			tab.close();
		}

		this.rename = function(id, title) {
			var tab = tabs[id];
			if (tab)
				tab.rename(title);
		}

		this.lift = function(id) {
			var tab = tabs[id], keys, i, key;
			if (tab) {
				if (id === activeTab) {
					this.deactivate();
					keys = Object.keys(tabs);
					for (i = keys.length - 1; i >= 0; i--) {
						key = Number(keys[i]);
						if (key !== id) {
							this.activate(key);
							break;
						}
					}
				}
				delete tabs[id];
				tabsLocation[id] = undefined;
			}
			return tab;
		};

		this.at = function(position) {
			var rect = element[0].getBoundingClientRect();
			return rect.left <= position.x && position.x <= rect.right
				&& rect.top <= position.y && position.y <= rect.bottom;
		}
	}

	function Tab(id, title) {
		var that = this;
		var active = false;
		var open = false;

		this.id = id;
		this.title = title;
		this.cmDocument = new CodeMirror.Doc('Loading...');

		var element =
			$('<div>', {'class': 'tab', 'data-id': id})
				.append($('<span>', {'class': 'title', 'text': this.title}))
				.append($('<i>', {'class': 'glyphicon glyphicon-remove close'}));

		setModeByExtension();

		this.activate = function() {
			if (!active) {
				element.addClass('active');
				active = true;
			}
		}

		this.deactivate = function() {
			if (active) {
				element.removeClass('active');
				active = false;
			}
		}

		this.open = function() {
			if (!open) {
				SyncClient.do('open', {
					doc: id,
					get: getText,
					set: setText
				});
				open = true;
			}
		}

		this.close = function() {
			if (open) {
				SyncClient.do('close', {doc: this.id});
				open = false;
			}
		}

		this.rename = function(name) {
			this.title = name;
			element.children('.title').text(name);
			setModeByExtension();
		}

		this.attach = function(elem) {
			element.appendTo(elem);
		}

		this.detach = function() {
			return element.detach();
		}

		this.lift = function(point) {
			element.css({
				position: 'fixed',
				left: point.x - element.width() / 2,
				top: point.y - element.height() / 2
			});
		}

		this.drop = function() {
			element.css({
				position: '',
				left: '',
				top: ''
			});
		}

		function getText() {
			return that.cmDocument.getValue();
		}

		function setText(value) {
			var anchor, head, text, cm = that.cmDocument;
			anchor = cm.indexFromPos(cm.getCursor('anchor'));
			head = cm.indexFromPos(cm.getCursor('head'));
			text = cm.getValue();
			cm.setValue(value);
			anchor = cm.posFromIndex(findNewIndex(anchor, text, value));
			head = cm.posFromIndex(findNewIndex(head, text, value));
			cm.setSelection(anchor, head);
		}

		function findNewIndex(oldIndex, oldText, newText) {
			var dmp, pos, pattern, delta, distance = 16;
			if (oldIndex && oldText && newText) {
				dmp = new diff_match_patch();
				pos = oldIndex-(distance/2) < 0 ? 0 : oldIndex-(distance/2);
				delta = oldIndex - pos;
				pattern = oldText.substr(pos, distance);
				return dmp.match_main(newText, pattern, pos) + delta;
			}
			return 0;
		}

		function setModeByExtension() {
			var matches, info;
			matches = /.+\.([^.]+)$/.exec(that.title);
			if (matches) {
				info = CodeMirror.findModeByExtension(matches[1]);
				if (info) {
					that.cmDocument = new CodeMirror.Doc(that.cmDocument.getValue(), info.mode);
					// Hack to work around CodeMirror's forced need to refresh the editor's mode
					// when our document might not actually have an editor at the time.
					var hackedInstance = {
						setOption: function() {
							var editor = that.cmDocument.getEditor();
							if (editor)
								return editor.setOption.apply(editor, arguments);
						},
						getOption: function() {
							var editor = that.cmDocument.getEditor();
							if (editor)
								return editor.getOption.apply(editor, arguments);
						}
					};
					CodeMirror.autoLoadMode(hackedInstance, info.mode);
				}
			}
		}
	}

	function Point(x, y) {
		this.x = x;
		this.y = y;

		this.distance = function(point) {
			var dx = this.x - point.x;
			var dy = this.y - point.y;
			var dist = Math.sqrt(dx*dx + dy*dy);
			return dist;
		}
	}

});
