<?php namespace App\Http\Controllers;

use Illuminate\Support\Facades\Input;
use App\UserSession;
use App\Project;
use App\ProjectAccess;
use App\Files;
use App\Message;

class ProjectController extends Controller {

	private $projects;
	private $id;
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
		$this->projects = new Project;
		$this->id = array();
	}


	/**
	 * Show the editor page.
	 *
	 * @return Response
	 */
	public function index($projectid, $projectname)
	{
		#!! projectname not used !!

		# check if access, else 404
		if(!$this->checkProjectAccess($projectid))
			return view('errors/404');

		$usersession = new Usersession;
		$usersession->handleUserAndSession($projectid);

		return view('editor')
			->with('messages', Message::newest($projectid));
	}

	public function create()
	{
		$projectname = Input::get('projectname');
		if(!$this->isDuplicate($projectname) && $projectname != '')
		{
			$userid = \Auth::user()->id;
			Project::create(['name' => $projectname, 'owner' => $userid]);
			$project = Project::where(['name' => $projectname, 'owner' => $userid])->first(array('projects.id'));
			ProjectAccess::create(['project' => $project->id, 'user' => $userid]);
			echo $this->projectsWithOwnerFlag();
		}
		else
		{
			echo "invalid";
		}
	}

	public function delete($projectid)
	{
		Project::where(['id' => $projectid, 'owner' => \Auth::user()->id])->delete();
		echo $this->projectsWithOwnerFlag();
	}

	public function put($projectid)
	{
		$projectname = Input::get('projectname');	

		if(!$this->isDuplicate($projectname) && $projectname != '')
		{
			$userid = \Auth::user()->id;
			$project = Project::where(['id' => $projectid, 'owner' => $userid])->update(['name' => $projectname]);
			echo $this->projectsWithOwnerFlag();
		}
		else
		{
			echo "invalid";
		}
	}

	

	private function isDuplicate($projectname)
	{
		$project = Project::where(['name' => $projectname, 'owner' => \Auth::user()->id])->first();
		return !is_null($project);
	}

	# Adds a flag to the JSON-object for every project the authenticated user owns { isowner : true}
	private function projectsWithOwnerFlag()
	{
		$projects = json_decode($this->projects->getProjects());
		$isowner = 'isowner';
		foreach ($projects as $key => $value)
		{
				if($projects[$key]->owner == \Auth::user()->id)
				{
					$projects[$key]->$isowner = true;
				}
		}
		return json_encode($projects);
	}

	private function hasOwnerRights($projectid) 
	{
		$owner = Project::where(['id' => $projectid, 'owner' => \Auth::user()->id])->first();
		return !is_null($owner);				
	}

}
