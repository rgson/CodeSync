@extends('app')

@section('content')
<main id='editor'>
	<div id='wrapper'>

		<div id='col-1' class='column'>
			<div id='editor-filemenu' class='btn-group'>
			<button id='file-dropdown-button' type='button' class='btn btn-default btn-xs dropdown-toggle' data-toggle='dropdown' aria-expanded='false'>
			File <span class='caret'></span>
			</button>
					<ul id='file-dropdown' class='dropdown-menu' role='menu'>
						<li id='drop-createFile'><i class='glyphicon glyphicon-plus'></i>Create file</li>
						<li id='drop-downloadProject'><i class='glyphicon glyphicon-download'></i>Download project</li>
						<li id='drop-help'><i class='glyphicon glyphicon-education'></i>Help</li>
					</ul>
			</div>
			<div id='filestructure'></div>
		</div>

		<div id='res-1' class='resizer' data-left='#col-1' data-right='#col-2'>
		</div>

		<div id='col-2' class='column'>
			<div id='workspace-1' class='workspace'>
				<div class='tabs'>
				</div>
				<textarea class='editor' spellcheck='false'></textarea>
			</div>
		</div>

		<div id='res-2' class='resizer' data-left='#col-2' data-right='#col-3'>
		</div>

		<div id='col-3' class='column'>
			<div id='workspace-2'  class='workspace'>
				<div class='tabs'>
				</div>
				<textarea class='editor' spellcheck='false'></textarea>
			</div>
		</div>

	</div>

	<div id='users'></div>

	<div id='chat' class='closed'>
		<div class='head'>
			<span class='glyphicon glyphicon-comment'></span>
		</div>
		<div class='body'>
		@foreach ($messages as $message)
			<p class='message' data-id='{{ $message->id }}'>
				<span class='sender'>{{ $message->sendername }}</span>
				<span class='content'>{{ $message->content }}</span>
			</p>
		@endforeach
		</div>
		<div class='footer'>
			<textarea id="writeMessage" rows='2'></textarea>
		</div>
	</div>

	<div id='filemenu' class='context-menu closed'>
		<ul>
			<li id='createFile'><i class='glyphicon glyphicon-plus'></i>Create</li>
			<li id='deleteFile'><i class='glyphicon glyphicon-remove'></i>Delete</li>
			<li id='renameFile'><i class='glyphicon glyphicon-pencil'></i>Rename</li>
		</ul>
	</div>

</main>
@endsection

@section('stylesheets')
	<link rel='stylesheet' type='text/css' href='/libs/codemirror/codemirror.css'>
	<link rel='stylesheet' type='text/css' href='/css/codemirror-theme-codesync.css'>
@endsection

@section('scripts')
	<script src='/libs/xxhash.min.lmd.js'></script>
	<script src='/libs/diff_match_patch.js'></script>
	<script src='/libs/codemirror/codemirror.js'></script>
	<script src='/libs/codemirror/addon/mode/loadmode.js'></script>
	<script src='/libs/codemirror/mode/meta.js'></script>
	<script src='/scripts/editor.js'></script>
	<script src='/scripts/editor.syncclient.js'></script>
	<script src='/scripts/editor.files.js'></script>
	<script src='/scripts/editor.chat.js'></script>
	<script src='/scripts/editor.resizer.js'></script>
	<script src='/scripts/editor.workspace.js'></script>
	<script src='/scripts/editor.users.js'></script>

@endsection
