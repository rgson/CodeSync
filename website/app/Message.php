<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Message extends Model {

	public function __get($property) {
		if ($property === 'sendername')
			return User::find($this->sender)->username;
		return parent::__get($property);
	}

	public static function newest($project, $count = 100) {
		return Message::where('project', '=', $project)
			->orderBy('id', 'desc')
			->take($count)
			->get()
			->reverse();
	}

	public static function after($project, $id) {
		return Message::where('project', '=', $project)
			->where('id', '>', $id)
			->orderBy('id', 'asc')
			->get();
	}

	public static function before($project, $id) {
		return Message::where('project', '=', $project)
			->where('id', '<', $id)
			->orderBy('id', 'asc')
			->get();
	}

}
