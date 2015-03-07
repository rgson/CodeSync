<?php namespace App\Http\Controllers;
use App\Project;
use App\User;
class HomeController extends Controller {

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
	 * Show the projects.
	 *
	 * @return Response
	 */
	public function index()
	{
		$Project = new Project;		

		$projects = $Project->getProjects();	
	
		$ownerNames = $this->ownerName($Project, $projects);
	
		return view('home')
		->with('projects', $projects)
		->with('ownerNames', $ownerNames);		
	}

	private function ownerName($P, $projects)
	{
		$arr = array();	
		foreach ($projects as $key => $value) 
		{					
			$arr[$value->owner] = $P->getProjectOwnerName($value);		
		}

		return $arr;
	}
}
