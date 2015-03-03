<?php namespace App;
use App\User;
use Illuminate\Database\Eloquent\Model;

class Projects extends Model {

	public function getProjects() 
	{
		return Projects::join('projacc', 'id', '=', 'projacc.projid')->
		where('projacc.userid', "=", \Auth::user()->id)->get();
	}

	public function getProject($ownerId, $projectName)
	{
		return Projects::join('projacc', 'id', '=', 'projacc.projid')
		->where('projacc.userid', '=', \Auth::user()->id)
		->where('projects.owner', '=', $ownerId)
		->where('projects.name', '=', $projectName)
		->get();
	}

	public function getProjectOwnerName($project){
		return \DB::table('users')->select('name as ownername')
						->where('id', '=', $project->owner)
						->get();

		
	}
}
