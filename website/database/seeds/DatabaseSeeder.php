<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class DatabaseSeeder extends Seeder {

	public function run()
	{
		Model::unguard();

		$this->call('UsersSeeder');
		$this->call('ProjectsSeeder');
		$this->call('UserSessionsSeeder');
		$this->call('MessagesSeeder');
	}

}
