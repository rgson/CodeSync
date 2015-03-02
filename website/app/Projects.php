<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Projects extends Model {

	public function scopeProjects() #is called as "projects()"
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
}
