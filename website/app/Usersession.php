<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Usersession extends Model {
	protected $table = 'usersession';
	protected $fillable = ['userid', 'usersession'];
	public function scopeHandleUserAndSession() #is called as "::handleUserAndSession()
	{
		$userid = \Auth::user()->id;
		
		Usersession::where('userid', '=', $userid)->delete();

		do {
			$usersession = uniqid(null, true);			
		}
		while($this->duplicateSessionExists($usersession));
		
		Usersession::create(['userid' => $userid,'usersession' => $usersession]);
		
	}

	private function duplicateSessionExists($usersession)
	{
		$sessionExist = \DB::table('usersession')->where('usersession', $usersession)->first();
	
		if(is_null($sessionExist)){
			return false;
		}
		else {		
			return true;
		}
	}


}

