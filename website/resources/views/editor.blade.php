@extends('app')

@section('content')
<main id='editor'> 
<div class="container">
	<div class="row">
		<div class="col-md-10 col-md-offset-1">
			<div class="panel panel-default">
				<div class="panel-heading">Editor</div>
				<div class="panel-body">
					Kodeditorsidan
						<style> 
							.messageBubble {
								margin: 40px;
							  	display: inline-block;
							  	position: relative;
								width: 220px;
								height: auto;
								background-color: #999966;
							}

							.border {
	  							border: 8px solid #666;
	  						}

	  						.round {
								  border-radius: 30px;
						    }

							.tri-right.btm-left-in:after {
								content: ' ';
								position: absolute;
								width: 0;
								height: 0;
								left: 38px;
							    right: auto;
							    top: auto;
								bottom: -31px;
								border: 12px solid;
								border-color: #663300 transparent transparent #663300;
							}

							.content {
								padding: 1em;
								text-align: left;
								line-height: 1.5em;
							}

							.panel-body {
								background: #D6D6CC;
								overflow: hidden;
							}

							.chatt {
								background: #F0EBE6;
								float: right;
								width: 400px;
							}

							.code{
								background: #F5F5F0;
								float: left;
								width: 750px;
							}

						</style>

						<div class="code">
							<label for="happyCoding"><br> Here is all the code!</label>

						<div class="chatt">
							<div class="read">
								<div class="messageBubble tri-right border round btm-left-in">
									<div class="content">
									<label for="user">johan:<br></label>
									<p><br>hej</br></p>
								</div>
							</div>
							<div class="write">
								<textarea name="writeMsg" rows="3" cols="40"></textarea><br>
								<input type="submit" value="Send message">
							</div>					
						</div>					
				</div>				
			</div>	
		</div>
	</div>
</div>
</main>
@endsection
