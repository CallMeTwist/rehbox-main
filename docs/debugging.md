## Video upload limits

Exercise video uploads are capped at 30 MB by Filament. For uploads to succeed, the API host must allow request bodies of that size. In `php.ini`:

| Directive | Value |
|---|---|
| `upload_max_filesize` | `32M` |
| `post_max_size` | `40M` |
| `memory_limit` | `256M` |
| `max_execution_time` | `120` |

If running behind Nginx, also set `client_max_body_size 40M;` in the server block. Apache inherits PHP's limits automatically. After changing `php.ini` or Nginx config, restart the relevant service.

If a 30 MB upload fails silently:
1. Check `storage/logs/laravel.log` for a Livewire `TooLarge` exception.
2. Check the web-server error log for `client intended to send too large body` (Nginx).
3. Confirm `php -i | grep -E 'upload_max_filesize|post_max_size'` matches the table above.
