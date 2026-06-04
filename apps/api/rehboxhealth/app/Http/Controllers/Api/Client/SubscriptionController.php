<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\VerifySubscriptionRequest;
use App\Models\AppSetting;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    /**
     * Plan amounts in kobo (Paystack's smallest unit).
     *
     * @return array<string, int>
     */
    private function planAmounts(): array
    {
        return [
            'basic' => 350000,  // ₦3,500
            'standard' => (int) AppSetting::getValue('standard_plan_price_kobo', 200000),
            'premium' => 2000000, // ₦20,000
        ];
    }

    public function initialize(Request $request): JsonResponse
    {
        $data = $request->validate([
            'plan' => 'required|in:basic,standard,premium',
        ]);

        $amounts = $this->planAmounts();
        $client = $request->user()->client;
        $reference = 'RHB-'.strtoupper(Str::random(12));

        $response = Http::withToken(config('services.paystack.secret'))
            ->post('https://api.paystack.co/transaction/initialize', [
                'email' => $request->user()->email,
                'amount' => $amounts[$data['plan']],
                'reference' => $reference,
                'callback_url' => config('app.frontend_url').'/upgrade/callback?reference='.$reference,
                'metadata' => [
                    'client_id' => $client->id,
                    'plan' => $data['plan'],
                ],
            ]);

        if (! $response->successful()) {
            return response()->json(['message' => 'Payment initialization failed.'], 500);
        }

        Subscription::create([
            'client_id' => $client->id,
            'paystack_reference' => $reference,
            'plan' => $data['plan'],
            'amount' => $amounts[$data['plan']] / 100,
            'status' => 'pending',
        ]);

        return response()->json([
            'authorization_url' => $response->json('data.authorization_url'),
            'reference' => $reference,
        ]);
    }

    /**
     * Confirm a payment from the browser callback (works locally and as a
     * fallback when the webhook is delayed). Verifies the transaction with
     * Paystack before granting access.
     */
    public function verify(VerifySubscriptionRequest $request): JsonResponse
    {
        $reference = $request->validated('reference');
        $client = $request->user()->client;

        $subscription = Subscription::where('paystack_reference', $reference)
            ->where('client_id', $client->id)
            ->first();

        if (! $subscription) {
            return response()->json(['message' => 'Subscription not found.'], 404);
        }

        if ($subscription->status === 'active') {
            return response()->json([
                'status' => 'active',
                'subscription_plan' => $client->subscription_plan,
            ]);
        }

        $response = Http::withToken(config('services.paystack.secret'))
            ->get('https://api.paystack.co/transaction/verify/'.$reference);

        if (! $response->successful() || $response->json('data.status') !== 'success') {
            return response()->json(['status' => 'pending'], 202);
        }

        $this->activateSubscription($subscription);

        return response()->json([
            'status' => 'active',
            'subscription_plan' => $subscription->plan,
        ]);
    }

    /**
     * Paystack webhook — called server-to-server when a charge succeeds.
     */
    public function webhook(Request $request): JsonResponse
    {
        $signature = $request->header('x-paystack-signature');
        $computed = hash_hmac('sha512', $request->getContent(), config('services.paystack.secret'));

        if (! $signature || ! hash_equals($computed, $signature)) {
            return response()->json(['message' => 'Invalid signature.'], 400);
        }

        if ($request->json('event') === 'charge.success') {
            $subscription = Subscription::where('paystack_reference', $request->json('data.reference'))->first();

            if ($subscription) {
                $this->activateSubscription($subscription);
            }
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * Grant the purchased plan to the client. Idempotent — safe to call from
     * both the webhook and the browser verify path.
     */
    private function activateSubscription(Subscription $subscription): void
    {
        if ($subscription->status === 'active') {
            return;
        }

        $expiresAt = now()->addMonth();

        $subscription->update([
            'status' => 'active',
            'starts_at' => now(),
            'expires_at' => $expiresAt,
        ]);

        $subscription->client->update([
            'subscription_plan' => $subscription->plan,
            'subscription_status' => 'active',
            'subscription_expires_at' => $expiresAt,
        ]);
    }
}
