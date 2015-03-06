<?php namespace App\Http\Controllers;
use App\Projacc;
use App\Projects;
class ProjectsController extends Controller {

	private $projacc;
	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->middleware('auth');
		$this->projacc = new Projacc;			
	}

	public function getMembers($projid) 
	{ 										
		echo $this->getAuthUserAndMembers($projid);		
	}

	public function deleteMember($projid, $userid) 
	{
		if($this->hasOwnerRights($projid))
		{	
			$this->projacc->removeUserAccess($projid, $userid);
			echo $this->getAuthUserAndMembers($projid);
		}
	}

	public function addMember($projectid)
	{

	}

	# Helper functions

	private function getAuthUserAndMembers($projid) 
	{	
		$members = $this->projacc->getAllUsersWithAccess($projid);
		$members = json_decode($members);
		$members['authuser'] = \Auth::user()->id;
		return json_encode($members);
	}

	private function hasOwnerRights($projid) 
	{
		$owner = Projects::where(['id' => $projid, 'owner' => \Auth::user()->id])->first();
		if(is_null($owner))
			return false;
		
		return true;			
	}
}






