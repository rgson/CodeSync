<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Message extends Model {
	protected $table = "message";

	public function insertDb($from, $project, $msg)
	{
		$date = new \DateTime; //Creates a timestamp.

		 \DB::table('message')->insert([
			'from' => $from,
			'project' => $project,
			'msg' => $msg,
			'created_at' => $date,
			'updated_at' => $date
			]);
	}

	public function getAllMessages() {
		 return \DB::table('message')->get();
		 
	}

	public function findAllMessagesForProject($project) {
		$message = \DB::table('message')->
		where('project', '=', $project)->
		orderBy('created_at', 'asc')->
		take(100)->
		get();
		
		return $message;
	}	

}
