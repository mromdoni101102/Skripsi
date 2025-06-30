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
        Schema::create('react_task', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_topics'); // Kita asumsikan ini terhubung ke tabel react_topics
            $table->integer('task_no')->nullable();
            $table->string('task_name');
            $table->string('test_filename')->nullable(); // <-- KOLOM PENTING KITA
            $table->text('caption')->nullable();
            $table->string('material')->nullable();
            $table->string('tipe')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('react_task');
    }
};
