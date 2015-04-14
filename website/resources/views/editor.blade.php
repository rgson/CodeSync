@extends('app')

@section('content')
<main id='editor'>
	<div id='wrapper'>

		<div id='col-1' class='column'>
			<div id='filestructure'>
				<?= printFileStructure($filestructure); ?>
			</div>
		</div>

		<div id='res-1' class='resizer' data-left='#col-1' data-right='#col-2'>
		</div>

		<div id='col-2' class='column'>
			<div class='workspace'>
				<textarea id='editor-1' spellcheck='false'>
					Synchronization has not been started (yet?).
				</textarea>
			</div>
		</div>

		<div id='res-2' class='resizer' data-left='#col-2' data-right='#col-3'>
		</div>

		<div id='col-3' class='column'>
			<div class='workspace'>
				<textarea id='editor-2' spellcheck='false'>
					Synchronization has not been started (yet?).
				</textarea>
			</div>
		</div>

	</div>

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
			<li>Rename</li>
			<li>Delete</li>
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
	<script src='/libs/codemirror/mode/javascript.js'></script>
	<script src='/scripts/editor.js'></script>
	<script src='/scripts/editor.syncclient.js'></script>
	<script src="/scripts/editor.files.js"></script>
	<script src="/scripts/editor.chat.js"></script>
	<script src="/scripts/editor.resizer.js"></script>

@endsection

<?php
function printFileStructure($fs) {
	echo '<ul>';
	foreach ($fs as $name => $id) {
		if(is_array($id)) {
			echo '<li><span>' . $name . '</span>';
			printFileStructure($id);
			echo '</li>';
		}
		else {
			echo "<li data-id='" . $id .  "'><span>" . $name . "</span></li>";
		}
	}
	echo '</ul>';
}
?>
