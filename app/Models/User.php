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

    public function cartoons(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Cartoon::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function getAvatarAttribute()
    {
        return $this->attributes['profile_picture_url'] ?? null;
    }

    public function setAvatarAttribute($value)
    {
        $this->attributes['profile_picture_url'] = $value;
    }

    public function getAvatarUrlAttribute()
    {
        $url = $this->profile_picture_url;
        if (!$url) {
            return asset('images/member-placeholder.svg');
        }
        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }
        if (str_starts_with($url, 'storage/')) {
            return asset($url);
        }
        return asset('storage/' . $url);
    }
}
