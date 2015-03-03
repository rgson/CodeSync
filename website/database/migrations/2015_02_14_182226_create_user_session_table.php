<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUserSessionTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('usersession', function(Blueprint $table)
		{
			$table->integer('userid')->length(10)->unsigned();
			$table->string('usersession');			
			$table->timestamps();
			$table->primary('usersession');	
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('usersession');
	}

}
