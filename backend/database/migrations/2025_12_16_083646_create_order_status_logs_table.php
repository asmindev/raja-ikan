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
        Schema::create('order_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'delivering', 'completed', 'cancelled']);
            $table->text('notes')->nullable()->comment('Catatan perubahan status');
            $table->foreignId('changed_by')->nullable()->constrained('users')->onDelete('set null')
                ->comment('User yang mengubah status (admin/driver)');
            $table->timestamps();

            // Index untuk query cepat
            $table->index('order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_status_logs');
    }
};
