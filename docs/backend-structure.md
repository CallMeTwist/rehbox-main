# Backend Structure

## Controller Map

```
app/Http/Controllers/Api/
├── Auth/
│   ├── PTAuthController.php
│   └── ClientAuthController.php
├── PT/
│   ├── ClientController.php          GET /pt/clients, GET /pt/clients/{id}, PATCH condition
│   ├── DashboardController.php       GET /pt/dashboard — stats, compliance chart, recent clients
│   ├── EarningsController.php        GET /pt/earnings — 15% commission breakdown
│   ├── ExerciseLibraryController.php GET /pt/exercises
│   ├── ExercisePlanController.php    POST/PUT/DELETE /pt/plans
│   ├── MotionReportController.php    GET /pt/clients/{id}/motion-reports
│   └── PTProfileController.php      GET/PATCH /pt/profile
└── Client/
    ├── ChatController.php            Handles BOTH PT and client chat, auto-resolves receiver_id
    ├── ProfileController.php        GET/PATCH /client/profile, POST /client/connect-pt
    ├── ProgressController.php       GET /client/progress
    ├── PushController.php           POST/DELETE /client/push/subscribe
    ├── RewardController.php         GET /client/rewards
    ├── SessionController.php        POST/PUT /client/sessions — awards coins on complete
    ├── ShopController.php           GET /client/shop, POST /client/shop/{item}/purchase
    └── SubscriptionController.php   POST /client/subscribe
```

## Middleware

```
app/Http/Middleware/
├── RoleMiddleware.php      alias: role   — checks user.role === 'pt' or 'client'
├── EnsureVetted.php        alias: vetted — checks physiotherapist->isVetted()
└── EnsureSubscribed.php    alias: subscribed — checks client->isSubscribed()
```

All aliases registered in `bootstrap/app.php` — there is no Kernel.php in Laravel 12.

## Events & Broadcasting

```
app/Events/
└── NewMessageReceived.php
    broadcastOn()  → PrivateChannel('chat.' . $message->client_id)
    broadcastAs()  → 'message.sent'   ← MUST match frontend .listen('.message.sent')
    broadcastWith() → {id, sender_id, receiver_id, client_id, body, created_at, sender}
```

## Model Map

```
app/Models/
├── User.php              isPT(), isClient()
├── Physiotherapist.php   isVetted(), belongs to User
├── Client.php            isSubscribed(), hasStandardAccess(), awardCoins(), spendCoins()
├── Exercise.php          belongsToMany ExercisePlan via pivot
├── ExercisePlan.php      belongsToMany Exercise, hasMany ExerciseSession
├── ExerciseSession.php   belongs to Client, Exercise, ExercisePlan
├── Message.php           fillable includes file fields
├── AppNotification.php   user_id, type, title, body, data (array), read_at (datetime)
├── Subscription.php      Paystack payment records — belongs to Client
├── PushSubscription.php  browser push tokens — belongs to User
├── ShopItem.php
├── Order.php
├── CoinTransaction.php
└── Reminder.php
```

## Filament Admin Panel

Sidebar (admin eyes only — never expose to PT/Client):
- Dashboard — stats widgets
- Message Monitor — all PT↔Client messages
- Reports Dashboard — session and revenue charts
- Clients — manage client accounts
- Exercises — add/edit (sets illustration_url AND video_url AND exercise_type AND tracking_config)
- Orders — shop orders
- Physiotherapists — vet PT applications
- Shop Items — rewards shop catalogue
- Subscriptions — Paystack records

## ChatController Notes

Handles both PT and client in one controller. Key behavior:
- If `receiver_id` not provided, resolves automatically from `client_id`
- PT sender → receiver = client's user_id
- Client sender → receiver = PT's user_id
- `index()` auto-resolves `client_id` from logged-in client if not passed as param
- Returns `{ messages: [] }` always (not raw array)
- `store()` returns `{ message: {} }` always

## Laravel Rules

- Middleware: `bootstrap/app.php` only — no Kernel.php
- Validation: Form Request classes only — never inline `$request->validate()`
- Queries: `Model::query()` and Eloquent — never `DB::`
- Config: `config('key')` in code — `env()` only inside `config/` files
- After any PHP change: `vendor/bin/pint --dirty --format agent`
