<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Message;

class MessagesSeeder extends Seeder {

    public function run()
    {
        DB::table('messages')->delete();

        Message::create([
            'content' => 'Hello world!',
        	'sender' => 1,
        	'project' => 1
        	]);
        Message::create([
            'content' => 'Hey, marvlund...',
            'sender' => 2,
            'project' => 1
            ]);
        Message::create([
            'content' => 'Yeah?',
            'sender' => 1,
            'project' => 1
            ]);
        Message::create([
            'content' => 'Happy coding! :)',
            'sender' => 2,
            'project' => 1
            ]);
    }

}
