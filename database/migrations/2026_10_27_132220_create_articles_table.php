<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            
            // Connection sa Writer (User)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); 
            
            $table->string('title');
            $table->foreignId('category_id')->constrained('categories')->onDelete('restrict');
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable(); 
            
            // Workflow Status: Draft, Pending Review, For Revision, Published, Unpublished
            $table->string('status')->default('Draft'); 
            
            // Analytics
            $table->integer('views')->default(0);
            $table->integer('shares')->default(0);
            
            // Editor Feedback
            $table->text('remarks')->nullable(); 
            
            // Timestamp when published
            $table->timestamp('published_at')->nullable();
            
            $table->timestamps(); // Automatic created_at and updated_at
        });
    }

};