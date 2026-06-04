<?php

use App\Models\Client;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['services.paystack.secret' => 'sk_test_fake_secret']);
});

it('activates the client when the browser verify confirms a successful charge', function () {
    $user = User::factory()->create(['role' => 'client']);
    $client = Client::factory()->create([
        'user_id' => $user->id,
        'subscription_plan' => 'free',
        'subscription_status' => 'inactive',
    ]);

    $subscription = Subscription::create([
        'client_id' => $client->id,
        'paystack_reference' => 'RHB-TESTREF123',
        'plan' => 'standard',
        'amount' => 2000,
        'status' => 'pending',
    ]);

    Http::fake([
        'api.paystack.co/transaction/verify/*' => Http::response(['data' => ['status' => 'success']], 200),
    ]);

    $this->actingAs($user)
        ->getJson('/api/client/subscribe/verify?reference=RHB-TESTREF123')
        ->assertOk()
        ->assertJson(['status' => 'active', 'subscription_plan' => 'standard']);

    expect($client->fresh()->subscription_plan)->toBe('standard')
        ->and($client->fresh()->subscription_status)->toBe('active')
        ->and($subscription->fresh()->status)->toBe('active');
});

it('reports pending when the charge has not succeeded', function () {
    $user = User::factory()->create(['role' => 'client']);
    $client = Client::factory()->create([
        'user_id' => $user->id,
        'subscription_plan' => 'free',
        'subscription_status' => 'inactive',
    ]);

    Subscription::create([
        'client_id' => $client->id,
        'paystack_reference' => 'RHB-PENDING999',
        'plan' => 'standard',
        'amount' => 2000,
        'status' => 'pending',
    ]);

    Http::fake([
        'api.paystack.co/transaction/verify/*' => Http::response(['data' => ['status' => 'abandoned']], 200),
    ]);

    $this->actingAs($user)
        ->getJson('/api/client/subscribe/verify?reference=RHB-PENDING999')
        ->assertStatus(202)
        ->assertJson(['status' => 'pending']);

    expect($client->fresh()->subscription_plan)->toBe('free');
});

it('activates the client from a signed webhook', function () {
    $user = User::factory()->create(['role' => 'client']);
    $client = Client::factory()->create([
        'user_id' => $user->id,
        'subscription_plan' => 'free',
        'subscription_status' => 'inactive',
    ]);

    Subscription::create([
        'client_id' => $client->id,
        'paystack_reference' => 'RHB-HOOKREF456',
        'plan' => 'standard',
        'amount' => 2000,
        'status' => 'pending',
    ]);

    $payload = json_encode([
        'event' => 'charge.success',
        'data' => ['reference' => 'RHB-HOOKREF456'],
    ]);
    $signature = hash_hmac('sha512', $payload, 'sk_test_fake_secret');

    $this->call(
        'POST',
        '/api/paystack/webhook',
        [], [], [],
        ['HTTP_X-PAYSTACK-SIGNATURE' => $signature, 'CONTENT_TYPE' => 'application/json'],
        $payload,
    )->assertOk()->assertJson(['status' => 'ok']);

    expect($client->fresh()->subscription_plan)->toBe('standard')
        ->and($client->fresh()->subscription_status)->toBe('active');
});

it('rejects a webhook with an invalid signature', function () {
    $this->call(
        'POST',
        '/api/paystack/webhook',
        [], [], [],
        ['HTTP_X-PAYSTACK-SIGNATURE' => 'wrong', 'CONTENT_TYPE' => 'application/json'],
        json_encode(['event' => 'charge.success', 'data' => ['reference' => 'x']]),
    )->assertStatus(400);
});
