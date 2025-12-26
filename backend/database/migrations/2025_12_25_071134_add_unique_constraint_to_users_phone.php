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
        // First, update NULL phone numbers to a temporary unique value for existing users
        DB::statement("UPDATE users SET phone = CONCAT('temp_', id, '_', UNIX_TIMESTAMP()) WHERE phone IS NULL OR phone = ''");

        Schema::table('users', function (Blueprint $table) {
            // Make phone field unique and not nullable
            $table->string('phone')->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revert phone field to nullable and remove unique constraint
            $table->dropUnique(['phone']);
            $table->string('phone')->nullable()->change();
        });
    }
};
