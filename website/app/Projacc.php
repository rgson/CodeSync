<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Projacc extends Model {

	protected $table = 'projacc';

	public function getAllUsersWithAccess($projid)
	{
		return Projacc::join('users', 'userid', '=', 'users.id')
		->where('projacc.projid', '=', $projid)
		->get(array('users.name'));
	}
}
