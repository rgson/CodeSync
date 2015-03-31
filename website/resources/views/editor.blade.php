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
			<p class='message'>
				<span class='sender'>Robin</span>
				<span class='content'>Pendlar nästa utredning pendlar bästa. Asfaltsort för koepke minska sönder. Jag så län 1 399 965.6 bestämma exempel ta.</span>
			</p>
			<p class='message'>
				<span class='sender'>Johan</span>
				<span class='content'>Ha sig han än här, i kan. Men möjligheten men ifall dig lika klara. Är alltför siffra dig. Katastrof skulle katastrof sätt få.</span>
			</p>
			<p class='message'>
				<span class='sender'>Linus</span>
				<span class='content'>Stadsmiljöborgarrådet länsstyrelsen finns fram dig sattes partiklar inte. Sönder förslaget motormännen. Avgiften fattar kunde värmdö 555 tomas men för tomas. Trafikolycka (frågan bukt) dubbdäck 1 480 234 minska redan hoppas regeringen. September den lite bli. Lika att vinter siffra.</span>
			</p>
			<p class='message'>
				<span class='sender'>Anna</span>
				<span class='content'>Alltför bestämma tycker föreslår möjlig införa rapportera. Kommuner säger värmdö tycker 1 208 293.1 man budgetförhandlingar in miljöproblem.</span>
			</p>
		</div>
		<div class='footer'>
			<textarea rows='1'></textarea>
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
	<script src='/scripts/syncclient.js'></script>
	<script src='/scripts/editor.js'></script>
	<script src="/scripts/filestructure.js"></script>

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
