<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Message extends Model {

	public function insert($from, $project, $msg)
	{
		 \DB::table('message')->insert([
			'from' => $from,
			'project' => $project,
			'msg ' => $msg
			]);
	} 

	public function deleteMsg($msgId) {
		\DB::table('message')->where('Id', $msgId)->delete();

	}

	public function getAllMsg() {
		 return \DB::table('message')->get();
		 
	}

	public function findSingleMsg($name) {
			return \DB::table('message')->where('from', $name)->first();
	}
	

}