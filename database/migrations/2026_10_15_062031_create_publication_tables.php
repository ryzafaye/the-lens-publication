<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        //CATEGORIES TABLE
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('category_name', 50)->unique();
            $table->string('slug', 50)->unique();
        });

        //ARTICLES TABLE
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('editor_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('eic_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('title', 255);
            $table->string('slug', 255)->unique();
            $table->string('excerpt', 255)->nullable();
            $table->text('body');
            $table->string('status', 50)->default('draft');
            $table->boolean('is_archived')->default(false);
            $table->timestampTz('published_at')->nullable();
            $table->timestampsTz();
            $table->softDeletesTz();
        });

        //ARTICLE_IMAGES TABLE
        Schema::create('article_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('articles')->cascadeOnDelete();
            $table->foreignId('uploader_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('head_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('eic_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('image_type', 50);
            $table->string('status', 50)->default('pending');
            $table->text('file_url');
            $table->string('public_id', 255);
            $table->boolean('is_cover')->default(false);
            $table->timestampTz('created_at')->useCurrent();
        });

        //FINANCIAL_RECORDS TABLE
        Schema::create('financial_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('uploader_id')->constrained('users')->restrictOnDelete();
            $table->string('title', 255);
            $table->string('file_name', 255);
            $table->text('file_url');
            $table->string('public_id', 255);
            $table->timestampTz('created_at')->useCurrent();
        });

        //ACTIVITY_LOGS TABLE
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('action', 255);
            $table->string('entity_type', 100);
            $table->unsignedBigInteger('entity_id');
            $table->timestampTz('created_at')->useCurrent();
        });

        //FEEDBACK_TO_EDITORS TABLE
        Schema::create('feedback_to_editors', function (Blueprint $table) {
            $table->id();
            $table->string('sender_name', 255);
            $table->string('sender_email', 255);
            $table->string('subject', 255);
            $table->text('content');
            $table->string('status', 50)->default('unread');
            $table->timestampTz('created_at')->useCurrent();
        });

        //ARTICLE_VIEWS TABLE
        Schema::create('article_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('articles')->cascadeOnDelete();
            $table->string('ip_address', 45);
            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_views');
        Schema::dropIfExists('letters_to_editors');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('financial_records');
        Schema::dropIfExists('article_images');
        Schema::dropIfExists('articles');
        Schema::dropIfExists('categories');
    }
};