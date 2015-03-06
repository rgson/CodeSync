<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\User;

class UsersSeeder extends Seeder {

	public function run()
	{
		DB::table('users')->delete();

		User::create([
			'id' => 1,
			'username' => 'Marvlund',
			'email' => 'MarvinLund@rhyta.com'
			]);
		User::create([
			'id' => 2,
			'username' => 'Princess_Zelda',
			'email' => 'ZeldaCarlsson@dayrep.com'
			]);
		User::create([
			'id' => 3,
			'username' => 'Violetta89',
			'email' => 'ViolaHolmgren@jourrapide.com'
			]);
		User::create([
			'id' => 4,
			'username' => 'vikingeN',
			'email' => 'TorSamuelsson@jourrapide.com'
			]);
	}

}
