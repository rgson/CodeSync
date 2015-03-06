<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Project;
use App\ProjectAccess;

class ProjectsSeeder extends Seeder {

    public function run()
    {
        DB::table('project_access')->delete();
        DB::table('projects')->delete();

        Project::create([
            'id' => 1,
        	'name' => 'Marvlund.js',
        	'owner' => 1
        	]);
        Project::create([
            'id' => 2,
        	'name' => 'LinkedUp',
        	'owner' => 2
        	]);
        Project::create([
            'id' => 3,
        	'name' => 'Mjölner',
        	'owner' => 4
        	]);
        Project::create([
            'id' => 4,
            'name' => 'Thundr',
            'owner' => 4
            ]);

        ProjectAccess::create([
            'project' => 1,
            'user' => 1
            ]);
        ProjectAccess::create([
            'project' => 2,
            'user' => 2
            ]);
        ProjectAccess::create([
            'project' => 3,
            'user' => 4
            ]);
        ProjectAccess::create([
            'project' => 4,
            'user' => 4
            ]);

        ProjectAccess::create([
            'project' => 4,
            'user' => 1
            ]);
        ProjectAccess::create([
            'project' => 4,
            'user' => 2
            ]);
        ProjectAccess::create([
            'project' => 2,
            'user' => 1
            ]);
        ProjectAccess::create([
            'project' => 1,
            'user' => 2
            ]);
    }

}
