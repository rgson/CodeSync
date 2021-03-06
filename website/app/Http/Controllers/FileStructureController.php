<?php namespace App\Http\Controllers;

use Illuminate\Support\Facades\Input;
use Illuminate\Http\Response;
use App\UserSession;
use App\Files;

class FileStructureController extends Controller {
	
	public function get()
	{		
		$projectid = Input::get('projectid');
		if(!$this->checkProjectAccess($projectid))
			return response()->view('errors/403', [], 403);
		
		$filepaths = Files::where(['project' => $projectid])->orderBy('filepath')->get(['id', 'filepath']);
		$fp = [];

		foreach ($filepaths as $key => $value) {

			$fp[$value['id']] = $value['filepath'];
		}

		 return json_encode($this->create($fp));
	}

	private function create($paths)
	{
		$fileTree = [];

		foreach ($paths as $id => $path) {

			$parts = explode('/', $path);
			$current = &$fileTree;

			for($i = 1, $max = count($parts); $i < $max; $i++)
			{
				if(!isset($current[$parts[$i-1]]))
				{
					$current[$parts[$i-1]] = [];
				}
				$current = &$current[$parts[$i-1]];
			}
			$current[$parts[$i -1]] = $id;
		}

		return $fileTree;
	}	

	public function getSingle($projectid, $fileid) {
		if(!$this->checkProjectAccess($projectid))
			return response()->view('errors/403', [], 403);

		echo Files::find($fileid);
	}
}
