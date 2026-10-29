<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ExecutiveController extends Controller
{
    public function dashboard()
    {
        return view('executive.dashboard');
    }
}

