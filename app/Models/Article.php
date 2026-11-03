<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'category_id',
        'excerpt',
        'content',
        'status',
        'views',
        'shares',
        'remarks',
        'published_at'
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    protected $appends = ['date', 'endorser'];

    public function getDateAttribute()
    {
        return $this->created_at ? $this->created_at->format('M d, Y') : '';
    }

    public function getEndorserAttribute()
    {
        $categoryName = $this->category->name ?? '';
        if (empty($categoryName) && $this->category_id) {
            $cat = Category::find($this->category_id);
            $categoryName = $cat->name ?? '';
        }

        // Strictly determine Section Head based on the submitted article's category
        try {
            $headRole = null;
            if (stripos($categoryName, 'News') !== false) {
                $headRole = 'News Head';
            } elseif (stripos($categoryName, 'Liter') !== false) {
                $headRole = 'Literary Head';
            } elseif (stripos($categoryName, 'Feature') !== false) {
                $headRole = 'Feature Head';
            } elseif (stripos($categoryName, 'Sci') !== false || stripos($categoryName, 'Tech') !== false) {
                $headRole = 'Science and Technology Head';
            } elseif (stripos($categoryName, 'Opinion') !== false) {
                $headRole = 'Associate Editor-in-Chief';
            }

            if ($headRole) {
                $headUserQuery = User::whereHas('role', fn($q) => $q->where('role_name', $headRole));
                if (stripos($categoryName, 'Opinion') !== false) {
                    $headUserQuery->where('full_name', 'not like', '%Fax%');
                }
                $headUser = $headUserQuery->first();
                if ($headUser) {
                    $parts = preg_split('/\s+/', trim($headUser->full_name));
                    $last = array_pop($parts);
                    $prev = end($parts);
                    $lastName = ($prev && in_array(strtolower($prev), ['de', 'dela', 'del', 'delos', 'san'])) ? ($prev . ' ' . $last) : $last;
                    $headLabel = (stripos($headRole, 'Science') !== false) ? '(SciTech Head)' : ((stripos($headRole, 'Opinion') !== false || stripos($headRole, 'Editor') !== false) ? '(Opinion Head)' : "({$headRole})");
                    return "{$lastName} {$headLabel}";
                }
            }
        } catch (\Throwable $e) {
            // DB fallback
        }

        $fallbackMap = [
            'news' => 'Arquero (News Head)',
            'literature' => 'Llandelar (Literary Head)',
            'literary' => 'Llandelar (Literary Head)',
            'feature' => 'Dela Cruz (Feature Head)',
            'features' => 'Dela Cruz (Feature Head)',
            'science' => 'Apilado (SciTech Head)',
            'scitech' => 'Apilado (SciTech Head)',
            'opinion' => 'Briones (Opinion Head)',
            'opinions' => 'Briones (Opinion Head)',
        ];

        $lowerCat = strtolower($categoryName);
        foreach ($fallbackMap as $key => $val) {
            if (str_contains($lowerCat, $key)) {
                return $val;
            }
        }

        // Fallback: check remarks if category could not be resolved
        if (!empty($this->remarks)) {
            if (preg_match('/(?:Endorsed to EIC by|Approved by(?: Section Head)?:?)\s*([^\r\n]+)/i', $this->remarks, $matches)) {
                $matched = trim($matches[1]);
                $isMock = preg_match('/(?:Aris Thorne|Elena Ramos|Sofia Alcantara)/i', $matched);
                if (!empty($matched) && !$isMock) {
                    return $matched;
                }
            }
        }

        return 'Section Head';
    }

    public function getEndorsedByAttribute()
    {
        return $this->endorser;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}