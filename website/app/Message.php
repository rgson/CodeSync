<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Message extends Model {

	public function findAllMessagesForProject($project)
	{
		$messages = Message::where('project', '=', $project)
		->orderBy('created_at', 'asc')
		->take(100)
		->get();
		return $messages;
	}

}
