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
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('latitude', 10, 8)->nullable()->after('address')->comment('Koordinat pengiriman');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude')->comment('Koordinat pengiriman');
            $table->text('notes')->nullable()->after('longitude')->comment('Catatan customer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'notes']);
        });
    }
};
