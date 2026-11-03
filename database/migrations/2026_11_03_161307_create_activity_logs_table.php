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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('causer_name');
            $table->string('causer_role')->nullable();
            $table->string('action'); // e.g. "approved and endorsed", "returned for revision", "declined", "approved and published", "took down"
            $table->string('subject_type')->default('Article');
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('subject_name'); // article title
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
