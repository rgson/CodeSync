<?php
/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/
// Human endpoints
Route::get('/', 'WelcomeController@index');
Route::get('welcome', 'WelcomeController@index');
Route::get('home', 'HomeController@index');
Route::get('{projectid}/{name}', 'ProjectController@index');
Route::get('{projectid}', 'ProjectController@index');
Route::controllers([
	'auth' => 'Auth\AuthController',
	'password' => 'Auth\PasswordController',
]);
// AJAX endpoints
Route::get('projects', 'ProjectController@list');
Route::post('projects', 'ProjectController@create');
Route::get('project/{projectid}', 'ProjectController@details');
Route::delete('project/{projectid}', 'ProjectController@delete');
Route::get('project/{projectid}/members', 'ProjectAccessController@list');
Route::post('project/{projectid}/members', 'ProjectAccessController@create');
Route::delete('project/{projectid}/member/{userid}', 'ProjectAccessController@delete');
Route::get('project/{projectid}/chat', 'ChatController@list');
Route::post('project/{projectid}/chat', 'ChatController@create');
Route::get('project/{projectid}/files', 'FileController@list');
Route::post('project/{projectid}/files', 'FileController@create');
Route::delete('project/{projectid}/file/{fileid}', 'FileController@delete');
// Obsolete endpoints (to be removed!)
Route::get('chatMsg', 'ChatController@getAllMsg');
Route::get('projectMsg/{project}', 'ChatController@getMsgForProject');
Route::get('newMsg', 'ChatController@postNewMsg');