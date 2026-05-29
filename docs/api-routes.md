# API Routes

Base URL: `http://127.0.0.1:8000/api`

## Public Routes

```
POST /api/auth/pt/register
POST /api/auth/pt/login
POST /api/auth/client/register
POST /api/auth/client/login
POST /api/broadcasting/auth          ← Reverb presence/private channel auth (auth:sanctum)
```

## Authenticated (auth:sanctum)

```
POST /api/auth/logout
GET  /api/me
```

## PT Routes (role:pt)

```
GET   /api/pt/dashboard              ← stats, compliance chart, recent clients
GET   /api/pt/profile
PATCH /api/pt/profile
GET   /api/pt/exercises              ← exercise library (admin-managed)
                                        query: ?area=&category=&search=&difficulty=&access_tier=free|paid
GET   /api/pt/exercises/{id}
```

## PT Routes (role:pt + vetted)

```
GET    /api/pt/clients
GET    /api/pt/clients/{id}
PATCH  /api/pt/clients/{id}/condition
POST   /api/pt/plans
PUT    /api/pt/plans/{id}
DELETE /api/pt/plans/{id}
GET    /api/pt/chat?client_id={id}
POST   /api/pt/chat
GET    /api/pt/earnings
GET    /api/pt/clients/{id}/motion-reports
GET    /api/pt/sessions/{id}/detail
GET    /api/pt/notifications
PATCH  /api/pt/notifications/{id}/read
```

## Client Routes (role:client)

```
GET    /api/client/profile
PATCH  /api/client/profile
PATCH  /api/client/profile/language
GET    /api/client/exercises         ← tier-aware exercise library
                                        query: ?area=&category=&access_tier=free|paid
                                        response[].is_locked=true for paid exercises when client is on free tier
                                        response[].video = { source: 'upload'|'youtube'|null, url, youtube_id }
                                        response[].thumbnail_url (auto-generated for uploads + youtube fallback)
POST   /api/client/connect-pt        ← links client to PT via activation code
GET    /api/client/plan
POST   /api/client/subscribe
GET    /api/client/progress
GET    /api/client/progress/report/{month}/{year}
GET    /api/client/rewards
GET    /api/client/shop
GET    /api/client/shop/orders
GET    /api/client/chat
POST   /api/client/chat
POST   /api/client/push/subscribe
DELETE /api/client/push/unsubscribe
GET    /api/client/notifications
PATCH  /api/client/notifications/{id}/read
GET    /api/client/reminders
POST   /api/client/reminders
```

## Client Routes (role:client + subscribed)

```
POST /api/client/sessions
PUT  /api/client/sessions/{id}/complete
GET  /api/client/sessions/history
POST /api/client/shop/{item}/purchase
```

## Broadcasting Channels (routes/channels.php)

```
presence: online          ← any authenticated user, returns {id, name, role}
private:  chat.{clientId} ← PT who owns client, or client whose id matches
```
