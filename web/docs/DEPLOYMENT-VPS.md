# Deploying EstateInvestor on a VPS behind Cloudflare

This guide runs the whole platform on one server you rent, with Cloudflare in front:

```
visitor ──► Cloudflare (DNS, SSL, CDN) ──► Cloudflare Tunnel ──► your VPS (Docker)
                                                                  ├─ app      Next.js: pages, admin, chat API
                                                                  ├─ kong     gateway for the three services below
                                                                  ├─ auth     logins
                                                                  ├─ rest     database API
                                                                  ├─ storage  image and PDF uploads
                                                                  └─ db       Postgres
```

Everything is defined in [`docker-compose.prod.yml`](../docker-compose.prod.yml). The server publishes no ports: visitors can only arrive through the tunnel.

For the hosted alternative (Vercel + Supabase Cloud) see [DEPLOYMENT.md](DEPLOYMENT.md).

Replace `yourdomain.com` with your real domain everywhere below.

---

## 0. What you need

- A domain, added to a free [Cloudflare](https://dash.cloudflare.com) account and using Cloudflare's nameservers.
- A VPS with **Ubuntu 24.04, 2 vCPU, 4 GB RAM, 40 GB disk** or more. The database and its services use about 300 MB when idle; the rest is room for the app, image builds and growth.
- At least one AI key: Gemini, Groq, OpenRouter or Anthropic (see the README's "AI models").
- This repository reachable from the server (a private GitHub repo with a deploy key works well).

---

## 1. Prepare the server

Log in as root over SSH, then install Docker and turn on the firewall:

```bash
curl -fsSL https://get.docker.com | sh
```

```bash
ufw allow OpenSSH && ufw --force enable
```

Only SSH is open. Ports 80 and 443 stay closed because the tunnel connects outward to Cloudflare.

On a 4 GB server, add swap so an image build cannot run out of memory:

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Get the code. All later commands run from the `web/` folder:

```bash
git clone <your-repo-url> /opt/estateprofile && cd /opt/estateprofile/web
```

---

## 2. Create the Cloudflare Tunnel

In the Cloudflare dashboard: **Zero Trust → Networks → Tunnels → Create a tunnel → Cloudflared**.

1. Name it (for example `estateprofile`) and save.
2. On the "Install connector" screen, copy the token: the long `eyJ…` string at the end of the command shown. You don't run that command; the token goes into `deploy/.env` in step 4.
3. Under **Public hostnames**, add these, in this order:

| Order | Hostname | Service |
|---|---|---|
| 1 | `api.yourdomain.com` | `http://kong:8000` |
| 2 | `yourdomain.com` | `http://app:3000` |
| 3 | `*.yourdomain.com` | `http://app:3000` |

`api` must come before the wildcard, otherwise the wildcard catches it.

4. Cloudflare creates the DNS records for the first two hostnames itself. It does not create one for the wildcard, so add it by hand under **DNS → Records**: type `CNAME`, name `*`, target `<tunnel-id>.cfargotunnel.com` (copy the target from the `api` record), proxy **on**.

Cloudflare's free certificate covers `yourdomain.com` and `*.yourdomain.com`, which is every tenant subdomain.

---

## 3. Cloudflare settings

- **SSL/TLS → Overview**: set the mode to **Full**.
- **SSL/TLS → Edge Certificates**: turn on **Always Use HTTPS**.

Leave caching at its defaults. Cloudflare then caches images, scripts and styles, and passes pages through to the app.

---

## 4. Configure

```bash
cp deploy/.env.example deploy/.env
```

Generate the secrets and append them to the file. This writes the database password, the JWT secret and the two API keys:

```bash
docker run --rm -v "$PWD/scripts:/s:ro" node:22-alpine node /s/gen-secrets.mjs >> deploy/.env
```

Then edit `deploy/.env` and fill in:

| Variable | Value |
|---|---|
| `ROOT_DOMAIN` | `yourdomain.com` (no `https://`) |
| `SUPABASE_PUBLIC_URL` | `https://api.yourdomain.com` |
| `TUNNEL_TOKEN` | the token from step 2 |
| one AI key | for example `GROQ_API_KEY` |

The rest is optional for a first start. Keep `deploy/.env` private: `SERVICE_ROLE_KEY` gives full access to every tenant's data. Git already ignores the file.

---

## 5. Start

```bash
docker compose -f docker-compose.prod.yml --env-file deploy/.env up -d --build
```

The first run downloads the images and builds the app, which takes several minutes. The `migrate` service creates the tables, the security policies and the `media` upload bucket from `supabase/migrations/`, then exits.

Check that everything is up:

```bash
docker compose -f docker-compose.prod.yml --env-file deploy/.env ps -a
```

You should see `db`, `auth`, `storage` and `kong` as healthy, `rest`, `app` and `cloudflared` as running, and `migrate` as `Exited (0)`.

### Create the first site and admin

```bash
docker run --rm --network estateprofile_default -v "$PWD:/w" -w /w -e NEXT_PUBLIC_SUPABASE_URL=http://kong:8000 -e SUPABASE_SERVICE_ROLE_KEY="$(sed -n 's/^SERVICE_ROLE_KEY=//p' deploy/.env)" node:22-alpine sh -c 'corepack enable >/dev/null && pnpm install --prod --frozen-lockfile >/dev/null && node scripts/create-admin.mjs you@example.com "<password>" <slug> --create "Business Name"'
```

Agents can also sign up themselves at `https://yourdomain.com/signup`; those sites start on the Free plan. To change a plan, run the same command with `node scripts/set-plan.mjs <slug> solo` at the end.

---

## 6. Check it works

- [ ] `https://yourdomain.com` shows the landing page.
- [ ] `https://<slug>.yourdomain.com` shows the tenant's site.
- [ ] `/login` signs you in and `/admin` opens.
- [ ] Admin → Projects: uploading an image works, and its address starts with `https://api.yourdomain.com/storage/v1/object/public/media/`.
- [ ] The concierge chat answers.
- [ ] The contact form creates a lead under Admin → Leads.

---

## 7. Email

Two kinds of email are sent, and both are off until configured in `deploy/.env`:

- **Lead notifications**: `RESEND_API_KEY` and `LEADS_FROM_EMAIL`.
- **Sign-up confirmation and password emails**: the `SMTP_*` values. [Resend](https://resend.com) works for both.

Until SMTP is set up, `AUTH_AUTOCONFIRM=true` lets new accounts sign in without confirming their address. Once SMTP is tested, set `AUTH_AUTOCONFIRM=false` and run the start command from step 5 again.

---

## 8. Tenants' custom domains

Solo and Team sites can use their own domain. This uses **Cloudflare for SaaS**, which is free for the first 100 domains but asks for a payment card on the account.

One-time setup:

1. **DNS → Records**: add `CNAME`, name `customers`, target `<tunnel-id>.cfargotunnel.com`, proxy on.
2. **SSL/TLS → Custom Hostnames**: enable it and set the **fallback origin** to `customers.yourdomain.com`.
3. In the tunnel (**Zero Trust → Networks → Tunnels → your tunnel → Public hostnames**), edit the **catch-all rule** at the bottom from `http_status:404` to `http://app:3000`. Requests for clients' domains arrive with the client's hostname, which matches none of your own rules, so the catch-all must send them to the app.
4. To have the admin register domains automatically, create an API token (**My Profile → API Tokens**, permission **Zone → SSL and Certificates → Edit** on your zone) and put it in `deploy/.env` as `CLOUDFLARE_API_TOKEN`, together with `CLOUDFLARE_ZONE_ID` (on the zone's Overview page). Then run the start command again. Without the token, add each domain by hand under Custom Hostnames.

Per client: the agent enters the domain under Admin → Settings and creates a `CNAME` for `www` pointing to `customers.yourdomain.com` at their registrar. The certificate is issued within a few minutes of the record going live.

Bare domains (`clientdomain.com` without `www`) only work if the client's DNS provider supports CNAME records at the root (often called CNAME flattening or ALIAS). Recommend `www` and a redirect from the bare domain.

---

## 9. Backups

[`deploy/backup.sh`](../deploy/backup.sh) dumps the database and archives the uploaded files into `BACKUP_DIR`, and deletes backups older than `BACKUP_KEEP_DAYS`.

Run it once by hand to check it works:

```bash
sh deploy/backup.sh
```

Then schedule it nightly at 03:00:

```bash
(crontab -l 2>/dev/null; echo "0 3 * * * cd /opt/estateprofile/web && sh deploy/backup.sh >> /var/log/estateprofile-backup.log 2>&1") | crontab -
```

Backups on the same server do not survive losing the server. For an off-site copy, install [rclone](https://rclone.org), configure a remote (Cloudflare R2 has a free 10 GB tier), and set `BACKUP_RCLONE_REMOTE=<remote>:<bucket>` in `deploy/.env`.

### Restoring

Into a fresh install (after step 5, before creating any site):

```bash
docker compose -f docker-compose.prod.yml --env-file deploy/.env exec -T db pg_restore -U supabase_admin -d postgres --clean --if-exists < /var/backups/estateprofile/db-<stamp>.dump
```

```bash
docker compose -f docker-compose.prod.yml --env-file deploy/.env exec -T storage tar -xzf - -C /mnt < /var/backups/estateprofile/media-<stamp>.tar.gz
```

Practise a restore on a spare server before you rely on it.

---

## 10. Updating

```bash
git pull && docker compose -f docker-compose.prod.yml --env-file deploy/.env up -d --build
```

This rebuilds the app, applies any new migration, and restarts only what changed. The site is briefly unavailable while the app container restarts.

- **Changing `ROOT_DOMAIN`, `SUPABASE_PUBLIC_URL` or `ANON_KEY`** needs the rebuild above, because those values are compiled into the app.
- **Changing `POSTGRES_PASSWORD` or `JWT_SECRET` after the first start** does not work by editing the file: they are written into the database when it is first created.
- **Logs**: `docker compose -f docker-compose.prod.yml --env-file deploy/.env logs -f app` (or `auth`, `kong`, `db`, `cloudflared`).
- **Upgrading Supabase**: the image versions are pinned in `docker-compose.prod.yml` to the ones the local `supabase` CLI uses. Take a backup before changing them.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Cloudflare error 1033 or 502 on every page | `cloudflared` isn't connected: check `TUNNEL_TOKEN` and its logs. |
| `yourdomain.com` works but `<slug>.yourdomain.com` doesn't resolve | The `*` DNS record from step 2 is missing or not proxied. |
| Every page 404s | `ROOT_DOMAIN` doesn't match the address in the browser. Fix it and rebuild. |
| Login fails with a network error in the browser | `api.yourdomain.com` isn't routed to `http://kong:8000`, or it sits below the wildcard rule. |
| Signed in, but `/admin` sends you back to `/login` | `SUPABASE_PUBLIC_URL` was changed without rebuilding the app. |
| A client's custom domain shows a Cloudflare error | The tunnel's catch-all rule still returns 404, or the hostname isn't active yet under Custom Hostnames. |
| Sign-up says "check your inbox" but no email arrives | SMTP isn't configured; see step 7. |
| `migrate` shows `Exited (1)` | A migration failed and was rolled back: `docker compose … logs migrate` shows the SQL error. |
| Chat returns 503 "No AI provider configured" | No AI key in `deploy/.env`. |
