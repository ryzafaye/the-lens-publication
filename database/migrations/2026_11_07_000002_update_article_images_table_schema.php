<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Allow visual assets (photos, cartoons, infographics) to exist before article assignment
        DB::statement('ALTER TABLE article_images ALTER COLUMN article_id DROP NOT NULL;');

        // 2. Add optional editorial metadata columns
        Schema::table('article_images', function (Blueprint $table) {
            if (!Schema::hasColumn('article_images', 'title')) {
                $table->string('title')->nullable()->after('article_id');
            }
            if (!Schema::hasColumn('article_images', 'caption')) {
                $table->text('caption')->nullable()->after('title');
            }
            if (!Schema::hasColumn('article_images', 'remarks')) {
                $table->text('remarks')->nullable()->after('is_cover');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('article_images', function (Blueprint $table) {
            if (Schema::hasColumn('article_images', 'remarks')) {
                $table->dropColumn('remarks');
            }
            if (Schema::hasColumn('article_images', 'caption')) {
                $table->dropColumn('caption');
            }
            if (Schema::hasColumn('article_images', 'title')) {
                $table->dropColumn('title');
            }
        });

        DB::statement('ALTER TABLE article_images ALTER COLUMN article_id SET NOT NULL;');
    }
};
