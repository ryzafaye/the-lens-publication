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
        if (Schema::hasTable('activity_logs')) {
            Schema::table('activity_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('activity_logs', 'causer_name')) {
                    $table->string('causer_name')->nullable()->after('user_id');
                }
                if (!Schema::hasColumn('activity_logs', 'causer_role')) {
                    $table->string('causer_role')->nullable()->after('causer_name');
                }
                if (!Schema::hasColumn('activity_logs', 'subject_type')) {
                    $table->string('subject_type')->default('Article')->after('action');
                }
                if (!Schema::hasColumn('activity_logs', 'subject_id')) {
                    $table->unsignedBigInteger('subject_id')->nullable()->after('subject_type');
                }
                if (!Schema::hasColumn('activity_logs', 'subject_name')) {
                    $table->string('subject_name')->nullable()->after('subject_id');
                }
                if (!Schema::hasColumn('activity_logs', 'remarks')) {
                    $table->text('remarks')->nullable()->after('subject_name');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('activity_logs')) {
            Schema::table('activity_logs', function (Blueprint $table) {
                $columns = ['causer_name', 'causer_role', 'subject_type', 'subject_id', 'subject_name', 'remarks'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('activity_logs', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
