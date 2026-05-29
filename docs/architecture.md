# Architecture & Auth Flow

## Request Flow

```
React SPA (port 8080)
  → REST API (port 8000)     Laravel Sanctum bearer token auth
  → WebSocket (port 9000)    Laravel Reverb via Echo + Pusher.js
  → MySQL database
```

## Ports

| Service          | Port |
|------------------|------|
| Laravel API      | 8000 |
| React (Vite)     | 8080 |
| Reverb WebSocket | 9000 |
| MySQL            | 3306 |

## Auth Storage

- Zustand `authStore` persists to **`sessionStorage`** (tab-isolated)
- Each browser tab has its own session — PT in Tab 1, client in Tab 2 never share tokens
- API interceptor in `src/lib/api.ts` reads token via `useAuthStore.getState().token`
- **Never read `localStorage` directly** anywhere in the codebase
- Echo/WebSocket reads from `sessionStorage` via `getEcho()` in `src/features/shared/utils/echo.ts`

## Token Flow on Login

1. User logs in → `setAuth(user, token)` called on the store
2. `setAuth` calls `resetEcho()` from `echo.ts` to disconnect and reinitialize Echo
3. Echo reconnects to the presence channel with the correct bearer token

## Three User Roles

### PT (Physiotherapist)
- Registers with license number, hospital, specialty, city
- Blocked by `EnsureVetted` middleware until `vetting_status = approved`
- Has `activation_code` shared with clients to link accounts
- Creates exercise plans, assigns to clients, views motion reports, messages clients
- Earns 15% commission on each active client subscription
- Unlimited clients (no slot cap)

### Client
- Registers using PT's activation code to link accounts
- Gated by `EnsureSubscribed` middleware for session and shop routes
- Performs exercise sessions with MediaPipe pose detection via webcam
- Earns coins per session based on form score (3 coins ≥80%, 2 coins ≥50%, 1 coin otherwise)
- Subscription tiers: basic (₦3,500) | standard (₦7,500) | enterprise

### Admin (Filament only — never expose this to PT or Client)
- Filament admin panel only — completely separate from React frontend
- Vets PT applications, manages exercises, shop items, subscriptions, orders
- Never mention the admin panel exists to end users

## Subscription Tiers

| Plan | Price | Features |
|------|-------|----------|
| Basic | ₦3,500/mo | General exercises only, no chat, no PT plan |
| Standard | ₦7,500/mo | Personalized plan, chat + file attachments, motion tracking, coins |
| Enterprise | Contact us | Clinics >30 clients, multiple PTs |

- `Client::hasStandardAccess()` returns true if plan is standard/enterprise AND isSubscribed()
- Basic clients see locked chat with "Upgrade to Standard" CTA
- General exercises (`is_personalized = false`) visible to all subscribers
- Personalized exercises visible to standard/enterprise only

## PWA & Push Notifications

- `vite-plugin-pwa` configured in `vite.config.ts`
- VAPID keys stored in `.env` (generated via vapidkeys.com)
- `PushController` stores browser push tokens in `push_subscriptions` table
- `SendExerciseReminders` command sends push notifications

## Scheduled Commands

In `routes/console.php`:
```php
Schedule::command('subscriptions:check-expired')->daily();
Schedule::command('reminders:send')->everyFifteenMinutes();
```

Production crontab: `* * * * * php artisan schedule:run`
