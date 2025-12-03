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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('from_number');
            $table->text('message_text')->nullable();
            $table->timestamp('message_timestamp');
            $table->enum('message_type', ['text', 'image', 'video', 'audio', 'document', 'sticker', 'location', 'contact', 'other', 'unknown']);
            $table->json('raw_data')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
