<?php namespace App\Http\Controllers;

use App\Projacc;
class ProjectsController extends Controller {

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->middleware('auth');
			

	}

	public function getMembers($projid) { 
		
		$projacc = new Projacc;	
		$members = $projacc->getAllUsersWithAccess($projid);
		$members = json_decode($members);
		$members['authuser'] = \Auth::user()->id;
		$members = json_encode($members);
		echo $members;
	}


}






