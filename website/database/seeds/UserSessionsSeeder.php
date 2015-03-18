<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\UserSession;

class UserSessionsSeeder extends Seeder {

    public function run()
    {
        DB::table('user_sessions')->delete();

        UserSession::create([
        	'user' => 1,
        	'session' => 'abc',
            'project' => 1
        	]);
        UserSession::create([
            'user' => 2,
            'session' => '123',
            'project' => 2
            ]);
    }

}
