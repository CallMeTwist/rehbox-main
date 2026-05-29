<?php

namespace App\Events;

use App\Models\Client;
use App\Models\ExercisePlan;
use App\Models\ExerciseSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;


class ClientStartedExercise implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public Client $client,
        public ExercisePlan $plan,
        public ExerciseSession $session
    ) {}

    public function broadcastOn(): Channel
    {
        // PT listens on their own private channel
        return new Channel('pt.' . $this->plan->physiotherapist_id);
    }

    public function broadcastAs(): string
    {
        return 'client.started';
    }

    public function broadcastWith(): array
    {
        return [
            'client_name'  => $this->client->user->name,
            'plan_title'   => $this->plan->title,
            'session_id'   => $this->session->id,
            'started_at'   => $this->session->started_at,
        ];
    }
}
