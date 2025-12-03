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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->enum('status', ['pending', 'delivering', 'completed', 'cancelled'])->default('pending');
            $table->decimal('total', 10, 2);
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('driver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('address');
            $table->timestamp('estimated')->nullable();
            $table->timestamp('delivery_at')->nullable();
            $table->timestamp('accepted_at')->nullable()
                ->comment('Kapan order diterima oleh driver');
            $table->timestamp('pickup_at')->nullable()
                ->comment('Kapan driver mulai pickup');
            $table->timestamp('delivering_at')->nullable()
                ->comment('Kapan driver mulai delivery/mengantar');
            $table->timestamp('cancelled_at')->nullable()
                ->comment('Kapan order dibatalkan');
            $table->timestamp('completed_at')->nullable()
                ->comment('Kapan order selesai dikirim');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
