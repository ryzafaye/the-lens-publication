<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    public function articles()
    {
        return $this->hasMany(Article::class);
    }

    public function __toString()
    {
        return $this->name ?? '';
    }
}
