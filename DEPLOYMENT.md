# ReHboX — Deployment Guide

How to put this project online.

- **Frontend** (the app users see): `apps/web/rehbox-motion-health-main` → hosted on **Vercel**.
- **Backend** (the API + database): `apps/api/rehboxhealth` → hosted on **DomainKing / HostAfrica / Syskay** (or any Laravel host).
- The two live on **different web addresses** and talk over the internet. Login uses a token (not cookies), so they don't need to share a domain.

Example addresses used below (replace with your own):
- App (frontend): `https://app.rehbox.ng`
- API (backend): `https://api.rehbox.ng`

---

## ⚠️ Read this first — choose your backend plan

The backend needs three things many cheap hosting plans don't allow:

1. **SSH access** — to install the app (run `composer` and `php artisan`).
2. **Live chat (Reverb)** — needs a program that runs 24/7. Normal shared hosting can't do this.
3. **Background jobs (queues)** — same problem.

So choose ONE of these:

- **Shared cPanel hosting** (cheapest): works, but you must (a) make sure SSH is enabled, (b) use **Pusher** for live chat, and (c) run jobs with a cron task. Steps below.
- **A VPS** (recommended): a small server where everything — including live chat — runs normally. Both HostAfrica and DomainKing sell these.

👉 If you want the least hassle and working chat, get a **VPS**. If budget is tight, **shared cPanel + Pusher** is fine.

---

## Part 1 — Backend (the API)

### Step 1: Prepare the hosting

In cPanel (or on the VPS):

1. Set **PHP to version 8.3**.
2. Turn on these PHP extensions: `bcmath, ctype, curl, fileinfo, gd, json, mbstring, openssl, pdo_mysql, tokenizer, xml, zip`.
3. Make sure **SSH is enabled** (ask support if unsure).
4. Create a **MySQL database** and a **database user**. Write down the database name, username, and password.
5. Create the subdomain **`api.rehbox.ng`**.
6. **Important:** point that subdomain's "Document Root" to the project's `public` folder:
   `…/apps/api/rehboxhealth/public` — *not* the project root.

### Step 2: Put the code on the server (over SSH)

```bash
# Let the server download the private repo:
ssh-keygen -t ed25519 -C "rehbox-deploy"     # press Enter for defaults
cat ~/.ssh/id_ed25519.pub                     # copy this, add it on GitHub:
#   GitHub repo → Settings → Deploy keys → Add deploy key (read-only is fine)

# Download the project (above the public folder):
git clone git@github.com:CallMeTwist/rehbox-main.git ~/rehbox-main
cd ~/rehbox-main/apps/api/rehboxhealth

# Install the backend:
composer install --no-dev --optimize-autoloader
cp .env.example .env          # then edit it — see Step 3
php artisan key:generate
```

### Step 3: Configure `.env`

Open `.env` and set at least these:

```env
APP_NAME=ReHboX
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.rehbox.ng       # must match your API address

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

QUEUE_CONNECTION=database
EXERCISE_VIDEO_DISK=public

# Email (for notifications / password reset) — use your host's SMTP details:
MAIL_MAILER=smtp
MAIL_HOST=...
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_FROM_ADDRESS="no-reply@rehbox.ng"
MAIL_FROM_NAME="ReHboX"

# Live chat — pick the one that matches your hosting (see Step 7):
BROADCAST_CONNECTION=pusher          # shared hosting
# BROADCAST_CONNECTION=reverb        # VPS
```

### Step 4: Allow the frontend to talk to the API (CORS)

Open `config/cors.php` and add your app address to `allowed_origins`:

```php
'allowed_origins' => [
    'http://localhost:8080',
    'https://app.rehbox.ng',     // ← your Vercel app address
],
```

If you skip this, the browser will block every request to the API.

### Step 5: Set up the database and videos

**Do NOT run `php artisan db:seed`.** The exercise seeder is destructive (it deletes all plans and sessions) and uses outdated category names. Instead, copy the working database:

1. On the current/dev machine, export it:
   ```bash
   mysqldump -u root rehboxhealth > rehbox.sql
   ```
2. Import `rehbox.sql` into the new database (phpMyAdmin → Import, or `mysql … < rehbox.sql`).
   This brings over all 113 exercises with their tracking settings, instructions, and video links.
3. Run migrations to be safe:
   ```bash
   php artisan migrate --force
   ```
4. If exercise tracking ever shows up empty, run:
   ```bash
   php artisan exercises:apply-rom
   ```

**Upload the videos** (about 1.85 GB — they are NOT in the code repo). Use SFTP or the File Manager to copy them into:
`apps/api/rehboxhealth/storage/app/public/exercises/videos/`
Then link storage so they're publicly viewable:
```bash
php artisan storage:link
```

### Step 6: Finish setup

```bash
php artisan config:cache
php artisan route:cache
```

Set up a cron job (cPanel → Cron Jobs) so scheduled tasks and background jobs run:

```cron
* * * * * cd ~/rehbox-main/apps/api/rehboxhealth && php artisan schedule:run >> /dev/null 2>&1
* * * * * cd ~/rehbox-main/apps/api/rehboxhealth && php artisan queue:work --stop-when-empty >> /dev/null 2>&1
```

### Step 7: Live chat (real-time)

Live chat needs a constantly-running server. Choose based on your hosting:

**On shared hosting → use Pusher (free tier):**
1. Create an app at pusher.com. Note the `app_id`, `key`, `secret`, `cluster`.
2. In `.env`: `BROADCAST_CONNECTION=pusher` plus `PUSHER_APP_ID`, `PUSHER_APP_KEY`, `PUSHER_APP_SECRET`, `PUSHER_APP_CLUSTER`.
3. The frontend settings for this go in Vercel (Part 2).

**On a VPS → use Reverb (built in):**
1. In `.env`: `BROADCAST_CONNECTION=reverb`, plus `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`, `REVERB_HOST=api.rehbox.ng`, `REVERB_PORT=443`, `REVERB_SCHEME=https`.
2. Keep it running with **Supervisor** (so it restarts automatically):
   ```ini
   [program:rehbox-reverb]
   command=php /home/USER/rehbox-main/apps/api/rehboxhealth/artisan reverb:start
   autostart=true
   autorestart=true
   user=USER

   [program:rehbox-queue]
   command=php /home/USER/rehbox-main/apps/api/rehboxhealth/artisan queue:work --tries=3
   autostart=true
   autorestart=true
   user=USER
   ```
   (On a VPS, Supervisor replaces the `queue:work` cron line from Step 6.)

---

## Part 2 — Frontend (the app, on Vercel)

1. Go to Vercel → **Add New Project** → import the `CallMeTwist/rehbox-main` repo.
2. **Root Directory:** `apps/web/rehbox-motion-health-main`
3. **Build command:** `npm run build`  ·  **Output directory:** `dist`
4. Add these **Environment Variables** (use these exact names):

   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://api.rehbox.ng/api` *(keep the `/api` at the end)* |
   | `VITE_REVERB_APP_KEY` | Pusher key, or Reverb key |
   | `VITE_REVERB_HOST` | Pusher: `ws-<cluster>.pusher.com` · Reverb: `api.rehbox.ng` |
   | `VITE_REVERB_PORT` | `443` |
   | `VITE_REVERB_SCHEME` | `https` |
   | `VITE_VAPID_PUBLIC_KEY` | only if using browser push notifications |

5. **Custom domain:** add `app.rehbox.ng`, then create the CNAME record Vercel shows you in your DNS settings.
6. Deploy. From now on, every push to the `main` branch updates the app automatically.

> The motion-tracking files are bundled automatically during the build — nothing extra to do.

---

## Part 3 — Domains & HTTPS

- In your DNS settings: point `api.rehbox.ng` to the backend server, and `app.rehbox.ng` to Vercel (Vercel gives you the exact record).
- **HTTPS is required on both** (the camera and app features won't work over plain http). cPanel: turn on AutoSSL. VPS: use Certbot. Vercel: automatic.

---

## Part 4 — Check everything works

- [ ] Opening `https://api.rehbox.ng` doesn't show an error or the host's default page.
- [ ] The app loads at `https://app.rehbox.ng` and you can log in.
- [ ] An exercise video plays (confirms videos + storage link).
- [ ] Paid client → start *Glute Bridge* → pink skeleton, green joint, reps count up.
- [ ] Free client → *Perform exercise* → camera opens with the skeleton.
- [ ] Chat sends and receives messages live.
- [ ] An admin can log into the admin panel.

---

## Part 5 — Updating later

- **Frontend:** nothing to do — pushing to `main` redeploys it on Vercel automatically.
- **Backend:** SSH in and run:
  ```bash
  cd ~/rehbox-main && git pull origin main
  cd apps/api/rehboxhealth
  composer install --no-dev --optimize-autoloader
  php artisan migrate --force
  php artisan config:cache && php artisan route:cache
  # VPS only: sudo supervisorctl restart rehbox-queue rehbox-reverb
  ```

---

## Things to remember

- **Videos and secrets are not in the code repo.** Always upload the videos and set the `.env` (and Vercel variables) by hand on each new server.
- **Never run `php artisan db:seed` on a real database** — it wipes plans and sessions. Import the database instead (Part 1, Step 5).
- **After changing any PHP/config/route file on the server,** re-run `php artisan config:cache && php artisan route:cache`.
- **To move videos to cloud storage later:** set `EXERCISE_VIDEO_DISK=s3` and the AWS keys in `.env` — no code change needed.
