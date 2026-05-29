# ReHboX — Deployment Guide

How to host this monorepo so that **`git push` to `main` updates production**.

- **Repo:** `git@github.com:CallMeTwist/rehbox-main.git`
- **Frontend:** `apps/web/rehbox-motion-health-main` (React + Vite → static build)
- **Backend:** `apps/api/rehboxhealth` (Laravel 12, PHP 8.3, MySQL)
- **Auth model:** token-based (Bearer token in sessionStorage) → frontend and backend can live on **different domains** (CORS only, no shared cookies needed).

---

## Architecture at a glance

```
                  github.com/CallMeTwist/rehbox-main  (one repo)
                          |                       |
            push webhook  |                       |  push webhook
                          v                       v
   Vercel / Cloudflare Pages              HostAfrica (DirectAdmin shared)
   root: apps/web/...                     docroot: apps/api/rehboxhealth/public
   builds dist/ → app.rehbox.ng           Laravel API → api.rehbox.ng
```

---

## 1. Frontend — Vercel (recommended) or Cloudflare Pages

Both are free and give true push-to-deploy. Steps for Vercel (Cloudflare Pages is identical):

1. Import the `rehbox-main` repo into Vercel.
2. **Root Directory:** `apps/web/rehbox-motion-health-main`
3. **Build command:** `npm run build` — **Output directory:** `dist`
4. **Environment Variables** (Project Settings → Environment Variables):
   - `VITE_API_URL` = `https://api.rehbox.ng/api`
   - `VITE_REVERB_APP_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME` — only once real-time is set up (see §6)
   - `VITE_VAPID_PUBLIC_KEY` — if using web push
5. **Custom domain:** add `app.rehbox.ng`, then create the CNAME it gives you in DirectAdmin DNS.
6. Done. Every push to `main` rebuilds only the web folder and redeploys automatically.

> Hosting the static build on HostAfrica instead is possible but requires a GitHub Action to build + FTP the `dist/` — more work for no benefit, since token auth makes a separate domain fine.

---

## 2. Backend — HostAfrica (DA Minister, DirectAdmin shared, SSH)

> ⚠️ Shared hosting **cannot run** `php artisan reverb:start` (persistent WebSocket) or a persistent `queue:work`. See §6 (real-time) and §5 (queues) for the workarounds.

### One-time setup (over SSH)

1. **DirectAdmin:** create a MySQL database + user (note name/user/password). Create the domain `api.rehbox.ng`.

2. **Deploy key** (lets the server pull the private repo):
   ```bash
   ssh-keygen -t ed25519 -C "hostafrica-deploy"      # save to ~/.ssh/id_ed25519
   cat ~/.ssh/id_ed25519.pub
   ```
   Add that public key on GitHub → repo **Settings → Deploy keys → Add** (read-only is enough).

3. **Clone** above the web root:
   ```bash
   git clone git@github.com:CallMeTwist/rehbox-main.git ~/rehbox-main
   ```

4. **Document root:** point `api.rehbox.ng` to `~/rehbox-main/apps/api/rehboxhealth/public`
   (DirectAdmin custom document root, or symlink the domain's `public_html` to that folder).

5. **Install & configure:**
   ```bash
   cd ~/rehbox-main/apps/api/rehboxhealth
   composer install --no-dev --optimize-autoloader
   cp .env.example .env          # then edit .env — see §4
   php artisan key:generate
   php artisan migrate --force
   php artisan storage:link
   php artisan config:cache && php artisan route:cache
   ```

6. **Upload the videos** (not in git) via SFTP/File Manager to:
   `~/rehbox-main/apps/api/rehboxhealth/storage/app/public/exercises/videos/`

---

## 3. Routine deploy (after first setup)

**Option A — manual (simplest):** SSH in and run the deploy script (§7):
```bash
cd ~/rehbox-main && bash deploy.sh
```

**Option B — automatic on push:** set up the webhook (§7) so every `git push` to `main` triggers the deploy automatically.

---

## 4. Backend `.env` essentials

```env
APP_NAME=ReHboX
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.rehbox.ng

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# CORS / frontend origin
SANCTUM_STATEFUL_DOMAINS=app.rehbox.ng
SESSION_DOMAIN=.rehbox.ng

QUEUE_CONNECTION=database        # see §5
BROADCAST_CONNECTION=pusher      # see §6 (Reverb cannot run on shared hosting)
```
Also add `https://app.rehbox.ng` to the allowed origins in `config/cors.php`.

---

## 5. Queues & scheduler (no persistent workers on shared hosting)

Use DirectAdmin → **Cron Jobs**:
```cron
* * * * * cd ~/rehbox-main/apps/api/rehboxhealth && php artisan schedule:run >> /dev/null 2>&1
* * * * * cd ~/rehbox-main/apps/api/rehboxhealth && php artisan queue:work --stop-when-empty >> /dev/null 2>&1
```
(For very low volume you can instead set `QUEUE_CONNECTION=sync` and skip the queue cron.)

---

## 6. Real-time (Reverb → Pusher)

`reverb:start` needs a long-running process + open port, which shared hosting forbids. Options:
- **Pusher hosted service (recommended for this plan):** Reverb is Pusher-protocol compatible, so it's a config swap.
  - Backend `.env`: `BROADCAST_CONNECTION=pusher` + `PUSHER_APP_ID`, `PUSHER_APP_KEY`, `PUSHER_APP_SECRET`, `PUSHER_APP_CLUSTER`.
  - Frontend env: set `VITE_REVERB_APP_KEY` = Pusher key, `VITE_REVERB_HOST` = `ws-<cluster>.pusher.com`, `VITE_REVERB_PORT` = `443`, `VITE_REVERB_SCHEME` = `https`.
- **Or** run Reverb on a small separate VPS later, and keep the API on HostAfrica.

Until configured, real-time (chat/live updates) is disabled in production; the REST API works normally.

---

## 7. Auto-deploy files

### `deploy.sh` (repo root) — run after each pull
```bash
#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/apps/api/rehboxhealth"
git -C "$(dirname "$0")" pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
echo "Deploy complete: $(date)"
```

### Webhook (DirectAdmin) — `public/deploy.php` in the backend
A signature-verified endpoint GitHub calls on push. Set a secret in the repo webhook
(Settings → Webhooks → payload URL `https://api.rehbox.ng/deploy.php`, content type
`application/json`, secret = `YOUR_SECRET`), then:
```php
<?php
$secret = 'YOUR_SECRET';
$payload = file_get_contents('php://input');
$sig = 'sha256=' . hash_hmac('sha256', $payload, $secret);
if (!hash_equals($sig, $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '')) {
    http_response_code(403); exit('bad signature');
}
echo shell_exec('cd ' . escapeshellarg(__DIR__ . '/../../..') . ' && bash deploy.sh 2>&1');
```
> Only works if `shell_exec` is permitted on your plan. If not, use Option A (manual `deploy.sh` over SSH).

---

## 8. Gotchas / reminders

- **Videos are NOT in git** (~1.85 GB). After any fresh clone/restore, re-upload them to
  `apps/api/rehboxhealth/storage/app/public/exercises/videos/` and run `php artisan storage:link`.
- **Secrets are NOT in git.** Set `.env` on the server and env vars in Vercel by hand.
- **Flaky network:** if `git push` hangs, just re-run it — it gets through on retry. SSH is routed
  over port 443 via `~/.ssh/config` (`HostName ssh.github.com`, `Port 443`).
- **Never `--force` push** to `main`. If a push is *rejected*, run `git fetch` then
  `git rebase origin/main`, then push.
- After PHP/config/route changes on the server, re-run `php artisan config:cache && php artisan route:cache`.
```
