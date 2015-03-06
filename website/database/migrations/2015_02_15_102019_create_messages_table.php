<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMessagesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('messages', function(Blueprint $table)
		{
			$table->increments('id');
			$table->string('content');
			$table->integer('sender')->length(10)->unsigned()->nullable();
			$table->integer('project')->length(10)->unsigned();
			$table->timestamps();

			$table->foreign('sender')->references('id')->on('users')->onDelete('set null');
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
		Schema::drop('messages');
	}

}
