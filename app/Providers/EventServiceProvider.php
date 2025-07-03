<?php

namespace App\Providers;

use App\Listeners\EnrollNewUserToTopics; // <-- Jangan lupa use di sini
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        // GABUNGKAN SEMUA LISTENER UNTUK EVENT Registered DI SINI
        Registered::class => [
            SendEmailVerificationNotification::class,
            EnrollNewUserToTopics::class, // <-- Penempatan yang benar
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
