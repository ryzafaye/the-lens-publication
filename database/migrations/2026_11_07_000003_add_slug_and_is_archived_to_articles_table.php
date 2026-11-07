<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            if (!Schema::hasColumn('articles', 'slug')) {
                $table->string('slug')->nullable()->after('title');
            }
            if (!Schema::hasColumn('articles', 'is_archived')) {
                $table->boolean('is_archived')->default(false)->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            if (Schema::hasColumn('articles', 'slug')) {
                $table->dropColumn('slug');
            }
            if (Schema::hasColumn('articles', 'is_archived')) {
                $table->dropColumn('is_archived');
            }
        });
    }
};
