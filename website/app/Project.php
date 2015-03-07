<?php namespace App;

use App\User;
use Illuminate\Database\Eloquent\Model;

class Project extends Model {

	public function getProjects()
	{
		return Project::join('project_access', 'id', '=', 'project_access.project')
		->where('project_access.user', "=", \Auth::user()->id)->get();
	}

	public function getProject($ownerId, $projectName)
	{
		return Project::join('project_access', 'id', '=', 'project_access.project')
		->where('project_access.user', '=', \Auth::user()->id)
		->where('projects.name', '=', $projectName)
		->first();
	}

	public function getProjectOwnerName($project){
		return \DB::table('users')->select('username as ownername')
						->where('id', '=', $project->owner)
						->get();


	}
}
