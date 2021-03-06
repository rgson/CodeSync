<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUserSessionsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('user_sessions', function(Blueprint $table)
		{
			$table->integer('user')->length(10)->unsigned();
			$table->string('session');
			$table->integer('project')->length(10)->unsigned();
			$table->timestamps();
			$table->primary('session');
			$table->foreign('user')->references('id')->on('users')->onDelete('cascade');
			$table->foreign('project')->references('id')->on('projects')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('user_sessions');
	}

}
