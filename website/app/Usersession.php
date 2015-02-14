<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Usersession extends Model {

	public static function insertUserAndSession($userid, $usersession)
	{
		\DB::table('usersession')->insert(
    		array(
    			'userid' => $userid,
    			'usersession' => $usersession)
		);
	}

	public static function getUser($userid)
	{
		$userExist = \DB::table('usersession')->where('userid', $userid)->first();
		
		if(is_null($userExist)){
			return false;
		}
		else {		
			return true;;
		}
	}

	public static function deleteUserAndSession($userid)
	{
		\DB::table('usersession')->where('userid', $userid)->delete();
	}

}
