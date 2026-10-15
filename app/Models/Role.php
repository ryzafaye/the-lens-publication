<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    // Allow mass assignment
    protected $fillable = ['role_name'];

    // A role has many users
    public function users()
    {
        return $this->hasMany(User::class);
    }
}