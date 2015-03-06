<?php namespace App\Http\Controllers;

use App\Message;
use Illuminate\Support\Facades\Input;

class ChatController extends Controller {

	public function getAllMsg()
	{
		$all_messages = Message::all();
		return view('chatMessages')->with('all_messages', $all_messages);
	}

	public function getMsgForProject($project) {
		$project_messages = new Message();
		$project_messages = $project_messages->findAllMessagesForProject($project);
		return view('chatMessages')->with('project_messages', $project_messages);
	}

	public function postNewMsg() {
		if (Input::has('from') && Input::has('project') && Input::has('msg')) {
			Message::create([
				'sender' => $from,
				'project' => $project,
				'content' = $msg
				]);
		} else {
			echo "All textboxes need to be filled";
		}
	}
}
