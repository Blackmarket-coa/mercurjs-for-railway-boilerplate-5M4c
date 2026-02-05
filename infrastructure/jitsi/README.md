# Jitsi Meet on Railway (Recommended: `jitsi/docker-jitsi-meet`)

This project should use **[`jitsi/docker-jitsi-meet`](https://github.com/jitsi/docker-jitsi-meet)** as the base for Railway deployment.

## Why this is the best option

Between:
- `Blackmarket-coa/jitsi-meet`
- `jitsi/docker-jitsi-meet`

the official `jitsi/docker-jitsi-meet` stack is the safest production choice because it is maintained by the Jitsi team, receives regular security/runtime updates, and has the canonical service split (`web`, `prosody`, `jicofo`, `jvb`) needed for stable conference routing.

---

## Railway deployment model

Deploy Jitsi as **4 Railway services** in one project:

1. `jitsi-web` (public)
2. `jitsi-prosody` (private)
3. `jitsi-jicofo` (private)
4. `jitsi-jvb` (private + UDP 10000 support when available)

Use the service definitions from `docker-compose.yml` in this directory as your source of truth for image versions and env vars.

> Note: Railway does not run Docker Compose directly in production; create one Railway service per container and copy each service's `image`, env vars, and mounts.

---

## Required environment variables

Start from `.env.railway.template` in this folder and configure:

- `PUBLIC_URL` → public HTTPS URL of `jitsi-web`
- `ENABLE_LETSENCRYPT=0` (Railway handles TLS)
- secure values for:
  - `JICOFO_AUTH_PASSWORD`
  - `JVB_AUTH_PASSWORD`
  - `JIGASI_XMPP_PASSWORD`
  - `JIBRI_RECORDER_PASSWORD`
  - `JIBRI_XMPP_PASSWORD`

For media quality on hosted platforms, tune:
- `JVB_STUN_SERVERS`
- optional `JVB_ADVERTISE_IPS` (if you have a static egress/IP setup)

---

## Rocket.Chat integration (Jitsi as call provider)

After both services are live:

1. Open **Rocket.Chat Admin → Settings → Video Conference**.
2. Enable video conferencing.
3. Set provider to **Jitsi**.
4. Set Jitsi domain to your Railway Jitsi URL host (for example: `meet.example.com`).
5. Save and test from a channel DM with the video button.

### Optional Rocket.Chat environment overrides

If you manage Rocket.Chat via env var overrides, set the corresponding `OVERWRITE_SETTING_*` keys for video conference provider = Jitsi and the Jitsi domain.

---

## MercurJS integration notes

This repo already integrates Rocket.Chat for customer/vendor/admin messaging through:
- backend Rocket.Chat API routes (`/store/rocketchat`, `/vendor/rocketchat`, `/admin/rocketchat`)
- embedded chat experiences in storefront/vendor/admin panels

Once Rocket.Chat is configured to use your Jitsi domain, MercurJS users can launch Jitsi meetings directly from Rocket.Chat without further application code changes.
