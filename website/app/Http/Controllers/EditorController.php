<?php namespace App\Http\Controllers;
use App\Usersession;
use App\Projects;
class EditorController extends Controller {

	/*
	|--------------------------------------------------------------------------
	| Editor Controller
	|--------------------------------------------------------------------------
	|
	| Main controller page for the project
	|
	*/

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->middleware('auth');
	}

	/**
	 * Show the editor page.
	 *
	 * @return Response
	 */
	public function project($ownerId, $projectName)
	{
		$projectName = rawurldecode($projectName);
		print $projectName;
		print $this->checkProjectAccess($ownerId, $projectName);
	
		Usersession::handleUserAndSession();
		return view('editor');
	}

	private function checkProjectAccess($ownerId, $projectName){
		$projects = new Projects;
		return $projects->getProject($ownerId, $projectName); 
	}

}
