<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class ProjectAccess extends Model {

	protected $table = 'project_access';

	public function getAllUsersWithAccess($projid)
	{
		return ProjectAccess::join('users', 'user', '=', 'users.id')
		->where('project_access.project', '=', $projid)
		->get(array('users.name'));
	}
}
