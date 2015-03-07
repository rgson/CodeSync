<?php namespace App\Http\Controllers;
use App\ProjectAccess;
use App\Project;
class ProjectAccessController extends Controller {

	private $projacc;
	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->middleware('auth');
		$this->projacc = new ProjectAccess;			
	}

	public function get($projid) 
	{ 										
		echo $this->getAuthUserAndMembers($projid);		
	}

	public function delete($projid, $userid) 
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
		$owner = Project::where(['id' => $projid, 'owner' => \Auth::user()->id])->first();
		return !is_null($owner);
					
	}
}






