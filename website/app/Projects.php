<?php namespace App;
use App\User;
use Illuminate\Database\Eloquent\Model;

class Projects extends Model {

	public function getProjects() 
	{
		return Projects::join('projacc', 'id', '=', 'projacc.projid')		
				->where('projacc.userid', "=", \Auth::user()->id)
				->orderBy('name', 'asc')
				->get();
	}

	public function getProject($projectid)
	{
		return Projects::join('projacc', 'id', '=', 'projacc.projid')
				->where('projacc.userid', '=', \Auth::user()->id)		
				->where('projects.id', '=', $projectid)
				->first();
	}

	public function getProjectOwnerName($project)
	{
		return \DB::table('users')->select('name as ownername')
				->where('id', '=', $project->owner)
				->get();		
	}
}
