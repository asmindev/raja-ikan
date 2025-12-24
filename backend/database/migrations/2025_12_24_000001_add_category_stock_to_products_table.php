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
        Schema::table('products', function (Blueprint $table) {
            $table->string('category')->nullable()->after('description')->comment('Kategori produk: Udang, Ikan, Cumi, dll');
            $table->integer('stock')->default(0)->after('price')->comment('Jumlah stok tersedia');
            $table->boolean('is_featured')->default(false)->after('is_active')->comment('Produk unggulan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['category', 'stock', 'is_featured']);
        });
    }
};
