<?php namespace App\Http\Controllers;

use Illuminate\Support\Facades\Input;
use Illuminate\Http\Response;
use App\Message;
use App\User;

class ChatController extends Controller {

	public function get($project) {

		if(!$this->checkProjectAccess($project))
			return response()->view('errors/403', [], 403);

		if (Input::has('after'))
			$messages = self::getAfter($project, Input::get('after'), Input::get('poll', true));
		else if (Input::has('before'))
			$messages = self::getBefore($project, Input::get('before'));
		else
			return response('', 400);

		$messages_array = [];
		foreach ($messages as $message) {
			$messages_array[] = [
				'id' => $message->id,
				'sender' => $message->sendername,
				'content' => $message->content
			];
		}
		return $messages_array;
	}

	public function create($project) {
		if(!$this->checkProjectAccess($project))
			return response()->view('errors/403', [], 403);

		$newMessage = new Message;
		$newMessage->content = Input::get('content');
		$newMessage->project = $project;
		$newMessage->sender = \Auth::user()->id;
		$newMessage->save();
	}

	private function getAfter($project, $after, $poll) {
		if (!$poll)
			return Message::after($project, $after);

		do {
			$messages = Message::after($project, $after);
			sleep(1);
		} while ($messages->isEmpty());

		return $messages;
	}

	private function getBefore($project, $before) {
		return Message::before($project, $before);
	}
}
