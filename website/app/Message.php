<?php namespace App;
use Illuminate\Database\Eloquent\Model;
class Message extends Model {

	public function findAllMessagesForProject($project, $lastMsg) {
		$messages = Message::where('project', '=', $project)
			->where('created_at', '>', $lastMsg)
			->orderBy('created_at', 'asc')
			->take(100)
			->get();
			
		return $messages;
	}

	public function addUserName($messages) {
		$numberOfMessages = $messages->count();

		if ($numberOfMessages > 0) {
			$extended = [];
			$users = User::all();
			
			$k = 0;
			do {
				foreach ($users as $user) {
					if ($user->id == $messages[$k]->sender) {
						$extended[] = [$user->username, $messages[$k]];
					}
				}

				$k++;
			} while ($k != $numberOfMessages);
			
			return $extended;
		}
	}
} 