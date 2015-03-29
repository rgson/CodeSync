@extends('app')

@section('content')
<main id='editor'>

	<div id='wrapper'>
		<div id='files'>
			<ul>
				<li><span>Hardcoded_Dir</span>
					<ul>
						<li><span>Hardcoded_1.txt</span></li>
						<li><span>Hardcoded_2.txt</span></li>
					</ul>
				</li>
			</ul>
		</div>

		<div id='workspace'>
			<textarea id='code-editor' spellcheck='false'>
var MAX_DENOMINATOR = 1000;

var longest_denominator = 0;
var longest_length = 0;
var i, length;

for (i = MAX_DENOMINATOR; i &gt; longest_length; i = i - 1) {
	length = find_recurrence_length(i);
	console.log(i + &#39;: &#39; + length);
	if (longest_length &lt; length) {
		longest_length = length;
		longest_denominator = i;
	}
}
return longest_denominator;



function find_recurrence_length(denominator) {
	var b = &#39;1&#39;, mod;
	if (denominator % 2 === 0 || denominator % 5 === 0)
		return 0;
	do {
		b += &#39;0&#39;;
		mod = big_mod(b, denominator);
	} while (mod !== 1 &amp;&amp; b.length &lt; denominator);
	return (mod === 1 ? b.length - 1 : undefined);
}

function big_mod(dividend, divisor) {
	var temp, mod = &#39;&#39;, take;
	do {
		dividend = mod.toString() + dividend;
		take = 16 - (divisor - 1).toString().length;
		temp = parseInt(dividend.substr(0, take));
		dividend = dividend.substr(take);
		mod = temp % divisor;
	} while (dividend.length);
	return mod;
}
			</textarea>
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
@endsection
