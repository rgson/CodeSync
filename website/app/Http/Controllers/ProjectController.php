<?php namespace App\Http\Controllers;
use App\UserSession;
use App\Project;
class ProjectController extends Controller {

	/*
	|--------------------------------------------------------------------------
	| Project Controller
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
	public function get($projectid, $projectname)
	}
		#!! projectname not used !!
		
		# check if access, else 404
		if(!$this->checkProjectAccess($projectid))
			return view('errors/404');
		 	
		Usersession::handleUserAndSession();
		return view('editor');
	}

	private function checkProjectAccess($projectid){
		$projects = new Project;
		return $projects->getProject($projectid); 
	}

}
