<?php

use App\Models\Client;
use App\Models\Exercise;
use App\Models\ExercisePlan;
use App\Models\ExerciseSession;
use App\Models\Physiotherapist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeSubscribedClient(): array
{
    $ptUser = User::factory()->create(['role' => 'pt']);
    $pt = Physiotherapist::factory()->create(['user_id' => $ptUser->id]);

    $clientUser = User::factory()->create(['role' => 'client']);
    $client = Client::factory()->create([
        'user_id' => $clientUser->id,
        'subscription_plan' => 'standard',
        'subscription_status' => 'active',
        'subscription_expires_at' => now()->addMonth(),
    ]);

    $plan = ExercisePlan::factory()->create([
        'physiotherapist_id' => $pt->id,
        'client_id' => $client->id,
    ]);

    $exercise = Exercise::factory()->create();

    return [$clientUser, $client, $plan, $exercise];
}

it('discards a started session when the owner cancels it', function () {
    [$clientUser, $client, $plan, $exercise] = makeSubscribedClient();

    $session = ExerciseSession::factory()->create([
        'client_id' => $client->id,
        'exercise_plan_id' => $plan->id,
        'exercise_id' => $exercise->id,
        'status' => 'started',
    ]);

    $this->actingAs($clientUser, 'sanctum')
        ->deleteJson("/api/client/sessions/{$session->id}")
        ->assertSuccessful();

    expect(ExerciseSession::find($session->id))->toBeNull();
});

it('refuses to cancel a completed session', function () {
    [$clientUser, $client, $plan, $exercise] = makeSubscribedClient();

    $session = ExerciseSession::factory()->create([
        'client_id' => $client->id,
        'exercise_plan_id' => $plan->id,
        'exercise_id' => $exercise->id,
        'status' => 'completed',
    ]);

    $this->actingAs($clientUser, 'sanctum')
        ->deleteJson("/api/client/sessions/{$session->id}")
        ->assertStatus(422);

    expect(ExerciseSession::find($session->id))->not->toBeNull();
});

it('forbids cancelling another client\'s session', function () {
    [, $client, $plan, $exercise] = makeSubscribedClient();

    $session = ExerciseSession::factory()->create([
        'client_id' => $client->id,
        'exercise_plan_id' => $plan->id,
        'exercise_id' => $exercise->id,
        'status' => 'started',
    ]);

    [$otherUser] = makeSubscribedClient();

    $this->actingAs($otherUser, 'sanctum')
        ->deleteJson("/api/client/sessions/{$session->id}")
        ->assertStatus(403);

    expect(ExerciseSession::find($session->id))->not->toBeNull();
});
