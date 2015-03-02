<?php namespace App\Http\Controllers;

use App\Message;

class ChatController extends Controller {
	public function index()
	{
		$messages = new Message();
		$messages = $messages->getAllMsg();
		
		return view('chatMessages')->with('messages', $messages);
	}
}