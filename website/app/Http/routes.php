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
Route::get('{projectid}/{name?}', 'ProjectController@index')->where('projectid', '[0-9]+');
Route::get('{projectid}', 'ProjectController@index')->where('projectid', '[0-9]+');

Route::get('/register', 'Auth\AuthController@getRegister');
Route::post('/register', 'Auth\AuthController@postRegister');
Route::get('/login', 'Auth\AuthController@getLogin');
Route::post('/login', 'Auth\AuthController@postLogin');
Route::get('/logout', 'Auth\AuthController@getLogout');
Route::post('/logout', 'Auth\AuthController@postLogout');
Route::get('/resetpassword', 'Auth\PasswordController@getEmail');
Route::post('/resetpassword', 'Auth\PasswordController@postEmail');

// AJAX endpoints
Route::get('projects', 'ProjectController@get');
Route::post('projects', 'ProjectController@create');
Route::delete('project/{projectid}', 'ProjectController@delete')->where('projectid', '[0-9]+');
Route::put('project/{projectid}', 'ProjectController@put')->where('projectid', '[0-9]+');

Route::get('project/{projectid}/members', 'ProjectAccessController@get')->where('projectid', '[0-9]+');
Route::post('project/{projectid}/members', 'ProjectAccessController@create')->where('projectid', '[0-9]+'); # post: username
Route::delete('project/{projectid}/member/{userid}', 'ProjectAccessController@delete')->where('projectid', '[0-9]+')->where('userid', '[0-9]+');

Route::get('user/{userid}', 'UserController@get')->where('userid', '[0-9]+');
Route::get('user/search/{username}', 'UserController@getSearch');

Route::get('project/{projectid}/chat', 'ChatController@get')->where('projectid', '[0-9]+');
Route::post('project/{projectid}/chat', 'ChatController@create')->where('projectid', '[0-9]+');

Route::get('project/{projectid}/files', 'FileStructureController@get')->where('projectid', '[0-9]+');
Route::get('project/{projectid}/file/{fileid}', 'FileStructureController@getSingle')->where('projectid', '[0-9]+')->where('fileid', '[0-9]+');;

