<?php namespace App;
use App\User;
use Illuminate\Database\Eloquent\Model;

class Project extends Model {

	protected $table = 'projects';
	protected $fillable = ['name', 'owner'];

	public function getProjects() 
	{
		return Project::join('project_access', 'id', '=', 'project_access.project')	
				->join('users', 'owner', '=', 'users.id')	
				->where('project_access.user', "=", \Auth::user()->id)
				->orderBy('name', 'asc')
				->get(array('projects.id', 'projects.name', 'projects.owner', 'users.username'));
	}

	public function getProject($projectid)
	{
		return Project::join('project_access', 'id', '=', 'project_access.project')
				->where('project_access.user', '=', \Auth::user()->id)		
				->where('projects.id', '=', $projectid)
				->first();
	}

	public function getProjectOwnerName($project)
	{
		return \DB::table('users')->select('username as ownername')
				->where('id', '=', $project->owner)
				->get();		
	}
}
