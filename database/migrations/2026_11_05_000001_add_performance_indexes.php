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
            $table->index(['status', 'created_at'], 'idx_articles_status_created_at');
            $table->index('user_id', 'idx_articles_user_id');
            $table->index('category_id', 'idx_articles_category_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('role_id', 'idx_users_role_id');
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->index('role_name', 'idx_roles_role_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropIndex('idx_articles_status_created_at');
            $table->dropIndex('idx_articles_user_id');
            $table->dropIndex('idx_articles_category_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role_id');
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->dropIndex('idx_roles_role_name');
        });
    }
};

