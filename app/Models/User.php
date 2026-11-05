<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The relationships that should always be eager loaded.
     *
     * @var list<string>
     */
    protected $with = ['role'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'role_id',
        'student_number',
        'full_name',
        'email',
        'password',
        'profile_picture_url',
        'avatar',
        'account_status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function articles()
    {
        return $this->hasMany(Article::class);
    }

    public function getAvatarAttribute()
    {
        return $this->attributes['profile_picture_url'] ?? null;
    }

    public function setAvatarAttribute($value)
    {
        $this->attributes['profile_picture_url'] = $value;
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('account_status')
              ->orWhereNotIn('account_status', ['deactivated', 'inactive', 'disabled']);
        });
    }

    public static function activeCount(): int
    {
        return static::active()->count();
    }
}
