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
        Schema::table('routes', function (Blueprint $table) {
            $table->text('osrm_url')->nullable()->after('estimated_duration');
            $table->json('waypoints')->nullable()->after('osrm_url');
            $table->json('optimized_order')->nullable()->after('waypoints');
            $table->json('legs')->nullable()->after('optimized_order');
            $table->json('geometry')->nullable()->after('legs');
            $table->timestamp('started_at')->nullable()->after('optimized_at');
            $table->timestamp('delivering_at')->nullable()->after('started_at');
            $table->timestamp('completed_at')->nullable()->after('delivering_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('routes', function (Blueprint $table) {
            $table->dropColumn(['osrm_url', 'waypoints', 'optimized_order', 'legs', 'geometry', 'started_at', 'delivering_at', 'completed_at']);
        });
    }
};
