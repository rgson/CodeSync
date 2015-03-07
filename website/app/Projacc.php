<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Projacc extends Model {

	protected $table = 'projacc';

	public function getAllUsersWithAccess($projid) 
	{
		return Projacc::join('users', 'userid', '=', 'users.id')
				->join('projects', 'projid', '=', 'projects.id')
				->where('projacc.projid', '=', $projid)
				->orderBy('name', 'asc')
				->get(array('users.name', 'users.id', 'projects.owner'));
	}

	public function removeUserAccess($projid, $userid) 
	{
		Projacc::join('users', 'userid', '=', 'users.id')
			->join('projects', 'projid', '=', 'projects.id')
			->where('projacc.projid', '=', $projid)
			->where('projacc.userid', '=', $userid)
			->delete();
	}
}
