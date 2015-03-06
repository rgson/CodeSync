<?php namespace App\Http\Controllers;
use App\Usersession;
use App\Projects;
class EditorController extends Controller {

	/*
	|--------------------------------------------------------------------------
	| Editor Controller
	|--------------------------------------------------------------------------
	|
	| Main controller page for the chosen project
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
	public function project($projectid, $projectname)
	}
		#!! projectname not used !!
		
		# check if access, else 404
		if(!$this->checkProjectAccess($projectid))
			return view('errors/404');
		 	
		Usersession::handleUserAndSession();
		return view('editor');
	}

	private function checkProjectAccess($projectid){
		$projects = new Projects;
		return $projects->getProject($projectid); 
	}

}
