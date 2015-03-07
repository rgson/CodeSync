<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectAccess extends Model {

	protected $table = 'project_access';

	public function getAllUsersWithAccess($projid) 
	{
		return ProjectAccess::join('users', 'user', '=', 'users.id')
				->join('projects', 'project', '=', 'projects.id')
				->where('project_access.project', '=', $projid)
				->orderBy('username', 'asc')
				->get(array('users.username', 'users.id', 'projects.owner'));
	}

	public function removeUserAccess($projid, $userid) 
	{
		ProjectAccess::join('users', 'user', '=', 'users.id')
			->join('projects', 'project', '=', 'projects.id')
			->where('project_access.project', '=', $projid)
			->where('project_access.user', '=', $userid)
			->delete();
	}
}
