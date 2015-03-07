<?php namespace App\Http\Controllers;
use App\UserSession;
use App\Project;
class ProjectController extends Controller {

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
	public function index($ownerId, $projectName)
	{
		$projectName = rawurldecode($projectName);
		var_dump($this->checkProjectAccess($ownerId, $projectName));
		if(!$this->checkProjectAccess($ownerId, $projectName)){ ## check if access, else 404
			return view('errors/404');
		}

		UserSession::handleUserAndSession();
		return view('editor');
	}

	private function checkProjectAccess($ownerId, $projectName){
		$projects = new Project;
		return $projects->getProject($ownerId, $projectName);
	}

}
