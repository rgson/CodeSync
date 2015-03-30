<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class UserSession extends Model {
	protected $table = 'user_sessions';
	protected $fillable = ['user', 'session', 'project'];
	public function handleUserAndSession($projectid)
	{
		$userid = \Auth::user()->id;

		UserSession::where('user', '=', $userid)->delete();

		do {
			$usersession = uniqid(null, true);
		}
		while($this->duplicateSessionExists($usersession));

		UserSession::create([
			'user' => $userid,
			'session' => $usersession,
			'project' => $projectid
			]);

		setcookie('sync_session', $usersession);
	}

	private function duplicateSessionExists($usersession)
	{
		$sessionExist = \DB::table('user_sessions')->where('session', $usersession)->first();
		return !is_null($sessionExist);
	}
}


