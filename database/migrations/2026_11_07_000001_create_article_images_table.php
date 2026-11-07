<?php

declare(strict_types=1);

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
        Schema::create('article_images', function (Blueprint $table) {
            $table->id();

            // Foreign Keys (CRITICAL)
            $table->foreignId('article_id')->constrained('articles')->onDelete('cascade');
            $table->foreignId('uploader_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('head_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('eic_approved_by')->nullable()->constrained('users')->nullOnDelete();

            // Data Columns
            $table->string('image_type'); // e.g., 'photo', 'cartoon', 'graphic'
            $table->string('status')->default('pending'); // e.g., 'pending', 'approved', 'rejected'
            $table->text('file_url'); // accommodates Supabase public URLs
            $table->string('public_id')->nullable(); // Supabase file path/reference
            $table->boolean('is_cover')->default(false); // main article thumbnail identifier

            $table->timestamps();

            // Indexes for querying performance
            $table->index(['article_id', 'is_cover'], 'idx_article_images_article_cover');
            $table->index('uploader_id', 'idx_article_images_uploader');
            $table->index('status', 'idx_article_images_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_images');
    }
};
