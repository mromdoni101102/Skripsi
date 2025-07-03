<?php

namespace App\Listeners;

use App\Models\React\ReactTopic_detail;
use App\Models\React\ReactUserEnroll;
use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class EnrollNewUserToTopics
{
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        // 1. Dapatkan user yang baru saja mendaftar
        $newUser = $event->user;

        // 2. Dapatkan semua ID materi yang ada
        $allTopics = ReactTopic_detail::all();

        // 3. Looping dan daftarkan user ke setiap materi
        foreach ($allTopics as $topic) {
            ReactUserEnroll::create([
                'id_users' => $newUser->id,
                'php_topics_detail_id' => $topic->id,
                'flag' => 0, // Set flag awal ke 0 (belum selesai)
            ]);
        }
    }
}
