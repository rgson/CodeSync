<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProjectAccessTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('project_access', function(Blueprint $table)
		{
			$table->integer('project')->length(10)->unsigned();
			$table->integer('user')->length(10)->unsigned();
			$table->primary(array('project', 'user'));
			$table->timestamps();
			$table->foreign('project')->references('id')->on('projects')->onDelete('cascade');
			$table->foreign('user')->references('id')->on('users')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('project_access');
	}

}
