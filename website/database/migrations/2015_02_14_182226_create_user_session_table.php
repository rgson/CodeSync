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
<<<<<<< HEAD
			$table->primary('usersession');	
=======
			$table->primary('userid');	
>>>>>>> dev-johan
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
