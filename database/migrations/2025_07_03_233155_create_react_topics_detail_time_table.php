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
        // Nama tabel disesuaikan dengan file migration Anda
        Schema::create('react_topics_detail_time', function (Blueprint $table) {
            $table->id();

            // Foreign key ke tabel users
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Foreign key ke tabel materi/topik Anda
            $table->foreignId('react_topics_detail_id')->constrained('react_topics_detail')->onDelete('cascade');

            $table->timestamp('start_time'); // Waktu mulai sesi belajar
            $table->timestamp('end_time')->nullable(); // Waktu selesai sesi, bisa NULL jika masih aktif

            $table->timestamps(); // Kolom created_at dan updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('react_topics_detail_time');
    }
};
