<?php namespace App\Http\Controllers;

use App\Message;
use Illuminate\Support\Facades\Input;

class ChatController extends Controller {

	public function get($project) {
		$messages = new Message();
		$m = new Message();
		$extendedMessages = [];

		$lastMsg = Input::get('last_message');

		$messages = $messages->findAllMessagesForProject($project, $lastMsg);

		return $extendedMessages = $m->addUsername($messages);
	}

	public function create() {
		$newMessage = new Message;
		$newMessage->content = Input::get('content');
		$newMessage->project = Input::get('project');
		$newMessage->sender =  \Auth::user()->id;

		$newMessage->save();
	}
}
