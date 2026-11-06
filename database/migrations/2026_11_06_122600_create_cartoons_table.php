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
        Schema::create('cartoons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('category')->default('Opinion');
            $table->string('artist')->nullable();
            $table->text('image_url');
            $table->string('file_size')->nullable();
            $table->string('status')->default('Pending with Head');
            $table->text('remarks')->nullable();
            $table->string('endorsed_by')->nullable();
            $table->integer('views')->default(0);
            $table->integer('shares')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at'], 'idx_cartoons_status_created_at');
            $table->index('user_id', 'idx_cartoons_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cartoons');
    }
};
