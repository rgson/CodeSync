<?php namespace App\Http\Controllers;
use App\Projects;
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
		$Projects = new Projects;		

		$projects = $Projects->getProjects();	
	
		$ownerNames = $this->ownerName($Projects, $projects);
	
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
