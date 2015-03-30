@extends('app')

@section('content')
<main id='editor'> 
<div class="container">
	<div class="row">
		<div class="col-md-10 col-md-offset-1">
			<div class="panel panel-default">
			<!-- Style for the chat -->
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

						<!-- Style for the file structure -->
						<style>
						#filestructure {
							float: left;
						}

						#items {
							list-style: none;
							padding: 0px;
							margin: 0px;
							font-size: 16px;							
						}

						#cmenu{
							display: none;
							position: fixed;
							border: 1px solid grey;
							width: 120px;
							background-color: lightgrey;
							box-shadow: 2px 2px 1px grey;
							cursor: pointer;
						}
						#items li
						{
							padding: 2px;
							border-bottom: 1px solid grey;
							border-bottom-style: dotted;
						}
						#items :hover {
							background: grey;
							color: white;
						}
						</style>
				<div class="panel-heading">Editor</div>
				<div class="panel-body">
				<div id='filestructure'>
					
					<?php 
						
						function printFileStructure($fs)
						{	

							echo '<ul>';																				
							foreach ($fs as $name => $id) 
							{																
								if(is_array($id))
								{
									echo '<li><span>' . $name . '</span>';
									printFileStructure($id);
									echo '</li>';
								}
								else
								{
									
									echo "<li data-id='" . $id .  "'><span>" . $name . "</span></li>";
								}
							}
							echo '</ul>';
							
						}
						
						printFileStructure($filestructure);
					 ?>
				</div>
			
				<div id='cmenu'>
				<ul id='items'>
					<li>Rename</li>
					<li>Delete</li>
				</ul>
				</div>

						
						
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

@section('scripts')
	<script src="/scripts/filestructure.js"></script>	
@endsection
