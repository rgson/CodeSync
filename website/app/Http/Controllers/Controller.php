<?php namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesCommands;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use App\Project;

abstract class Controller extends BaseController {

	use DispatchesCommands, ValidatesRequests;

	protected function checkProjectAccess($projectid)
	{
		$projects = new Project;
		$project = $projects->getProject($projectid);

		return !is_null($project);
	}

}
