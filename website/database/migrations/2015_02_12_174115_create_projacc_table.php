<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProjaccTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('projacc', function(Blueprint $table)
		{
			$table->integer('projid')->length(10)->unsigned();
			$table->integer('userid')->length(10)->unsigned();
			$table->primary(array('projid', 'userid'));			
			$table->timestamps();	
			$table->foreign('projid')->references('id')->on('projects');
			$table->foreign('userid')->references('id')->on('users');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('projacc');
	}

}