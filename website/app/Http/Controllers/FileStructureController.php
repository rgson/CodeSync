<?php namespace App\Http\Controllers;

use Illuminate\Support\Facades\Input;
use App\UserSession;
use App\Files;

class FileStructureController extends Controller {

	public function get()
	{
		$projectid = Input::get('projectid');
		$filepaths = Files::where(['project' => $projectid])->get(array('id', 'filepath'));
		$fp = array();

		foreach ($filepaths as $key => $value) {

			$fp[$value['id']] = $value['filepath'];
		}

		 return json_encode($this->create($fp));
	}

	private function create($paths)
	{
		$fileTree = array();

		foreach ($paths as $id => $path) {

			$parts = explode('/', $path);
			$current = &$fileTree;

			for($i = 1, $max = count($parts); $i < $max; $i++)
			{
				if(!isset($current[$parts[$i-1]]))
				{
					$current[$parts[$i-1]] = array();
				}
				$current = &$current[$parts[$i-1]];
			}
			$current[$parts[$i -1]] = $id;
		}

		return $fileTree;
	}
}
