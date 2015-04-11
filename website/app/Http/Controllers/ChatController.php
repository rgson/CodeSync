<?php namespace App\Http\Controllers;

use Illuminate\Support\Facades\Input;
use Illuminate\Http\Response;
use App\Message;
use App\User;

class ChatController extends Controller {

	public function get($project) {
		$after = Input::get('after');
		$before = Input::get('before');
		$poll = Input::get('poll', !!$after);	// Defaults to true for requests with 'after'

		if ((!$after && !$before) || ($after && $before))
			return response('', 400);

		if ($poll && $after) {
			do {
				$messages = Message::after($project, $after);
				sleep(1);
			} while ($messages->isEmpty());
		}
		else if ($after)
			$messages = Message::after($project, $after);
		else
			$messages = Message::before($project, $before);

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
		$newMessage = new Message;
		$newMessage->content = Input::get('content');
		$newMessage->project = $project;
		$newMessage->sender = \Auth::user()->id;
		$newMessage->save();
	}
}
