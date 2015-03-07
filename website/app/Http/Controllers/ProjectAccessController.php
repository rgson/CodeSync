<?php namespace App\Http\Controllers;

use Illuminate\Support\Facades\Input;
use App\ProjectAccess;
use App\Project;
use App\User;
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

	public function get($projectid) 
	{ 										
		echo $this->getAuthUserAndMembers($projectid);		
	}

	public function delete($projectid, $userid) 
	{
		if($this->hasOwnerRights($projectid))
		{	
			$this->projacc->removeUserAccess($projectid, $userid);
			echo $this->getAuthUserAndMembers($projectid);
		}
	}

	public function create($projectid)
	{
		$username = Input::get('username');
		$user = User::where(['username' => $username])->first(array('users.id'));

		if($this->hasOwnerRights($projectid) && $this->userExists($username) && !$this->isDuplicate($projectid, $user->id))
		{
						
			ProjectAccess::create(['project' => $projectid, 'user' => $user->id]);
			echo $this->getAuthUserAndMembers($projectid);
		}		
		else
		{
			echo "invalid";
		}
	}

	# Helper functions

	private function getAuthUserAndMembers($projectid) 
	{	
		$members = $this->projacc->getAllUsersWithAccess($projectid);
		$members = json_decode($members);
		$members['authuser'] = \Auth::user()->id;
		return json_encode($members);
	}

	private function hasOwnerRights($projectid) 
	{
		$owner = Project::where(['id' => $projectid, 'owner' => \Auth::user()->id])->first();
		return !is_null($owner);				
	}

	private function userExists($username)
	{
		$user = User::where(['username' => $username])->first();
		return !is_null($user);
	}

	private function isDuplicate($projectid, $user)
	{
		$access = ProjectAccess::where(['project' => $projectid, 'user' => $user])->first();
		return !is_null($access);
	}
}






