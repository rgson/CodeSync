<?php namespace App\Http\Controllers;

use App\Message;
use Illuminate\Support\Facades\Input;

class ChatController extends Controller { 
	public function getAllMsg() {
		$all_messages = new Message();
		$all_messages = $all_messages->getAllMessages();

		return view('chatMessages')->with('all_messages', $all_messages);
	}

	public function getMsgForProject($project) {
		$project_messages = new Message();
		
		$project_messages = $project_messages->findAllMessagesForProject($project);

		return view('chatMessages')->with('project_messages', $project_messages);
	}

	public function postNewMsg() { 
		$new_message = new Message();

		if (Input::has('from') && Input::has('project') && Input::has('msg')) {
			$from = Input::get('from');
			$project = Input::get('project');
			$msg = Input::get('msg');

			$new_message->insertDb($from, 
				$project, $msg);
		} else {
			echo "All textboxes need to be filled";
		}		
	}
}
