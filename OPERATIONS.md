# MyTV — Operator Guide

How to run the service day to day. This is an operations manual, not a build
guide. It assumes the platform is already deployed (backend + frontend on
Railway, Stripe live, Postgres provisioned).

Conventions used below:
- `API` = your backend base URL, e.g. `https://my-tv-backend-v2-production.up.railway.app/api/v1`
- `APP` = your frontend base URL, e.g. `https://app.yourdomain.com`
- Admin actions are done while signed in as an `ADMIN` / `SUPER_ADMIN` user.

---

## 1. Loading real streams into the system

A channel is **metadata** (name, category, premium flag). A **stream** is the
actual playable URL attached to a channel. A customer can only watch a channel
that has at least one **active** stream. Loading content is a two-step job:
make sure channels exist, then attach streams to them.

### Step 1 — Confirm channels exist
- Go to **Admin → Channels**. The seed ships 60 channels across 6 categories.
- Add or edit channels as needed (`+ Add Channel`). Set the **Premium** flag on
  channels you want behind the paywall.

### Step 2 — Attach streams (recommended: bulk CSV)
- Go to **Admin → Streams → ⬆ Import CSV**.
- Paste a CSV (format in section 2) where each row links one stream URL to one
  existing channel (matched by `channelId` or exact `channelName`).
- Click **Import**. The result panel shows how many were created and lists any
  per-row errors (unknown channel, bad type, missing URL).

### Step 2 (alternative) — Attach a single stream via API
```bash
curl -X POST "$API/streams" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channelId":"<channel-uuid>","url":"https://cdn.example/live.m3u8","streamType":"HLS","priority":0}'
```

### Step 3 — Set priority for failover
If a channel has multiple streams, the one with the **lowest `priority`** that
is `isActive` wins. Add a backup source at a higher priority number (e.g. 0 =
primary, 10 = backup) so you can disable a dead primary and the backup takes
over automatically.

### Step 4 — Validate (see section 3) before announcing.

> ⚠️ **Licensing:** every URL you load must point to content you have the legal
> right to distribute. This is the operator's responsibility, not the platform's.

---

## 2. Exact CSV format for bulk import

First line is the **header** (case-insensitive). Each subsequent line is one
stream attached to one channel.

### Columns
| Column        | Required | Notes |
|---------------|----------|-------|
| `channelId`   | one of these two | UUID of an existing channel. Takes precedence if both given. |
| `channelName` | one of these two | Exact channel name (case-insensitive). Used only if `channelId` is blank. |
| `url`         | **yes** | The playable stream URL. |
| `streamType`  | no (default `HLS`) | One of `HLS`, `DASH`, `RTMP`, `MP4`. |
| `priority`    | no (default `0`) | Lower = preferred. Integer. |

### Example — match by name
```csv
channelName,url,streamType,priority
BBC One,https://cdn.example/bbc1/index.m3u8,HLS,0
BBC One,https://backup.example/bbc1/index.m3u8,HLS,10
Sky Sports,https://cdn.example/skysports/index.m3u8,HLS,0
ESPN,rtmp://cdn.example/live/espn,RTMP,0
```

### Example — match by id
```csv
channelId,url,streamType,priority
3f9a1b2c-...,https://cdn.example/news/index.m3u8,HLS,0
```

### Rules / gotchas
- Quote any value containing a comma: `"News, World",https://...,HLS,0`.
- A row with an unknown channel or empty `url` is **skipped and reported** — the
  rest of the import still succeeds.
- Import **adds** streams; it never deletes. Re-importing creates duplicates, so
  remove old streams first if you are replacing a source.

---

## 3. Validating imported streams

### A. Automated health check (primary method)
- **Admin → Streams → 🩺 Health Check** probes every stream on the current page
  and shows ✓ OK or ✕ with the reason (timeout, HTTP status, "not a valid HLS
  manifest").
- **Check & Disable Broken** does the same and automatically sets `isActive =
  false` on anything that fails, so broken streams stop being served.
- Via API:
```bash
curl -X POST "$API/streams/health-check" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"channelId":"<uuid>","disableBroken":false}'
```
  What "healthy" means: the URL responded `2xx`, and for HLS the body contained
  a valid `#EXTM3U` manifest.

### B. Manual spot check
- Pick a few channels and open them in the customer dashboard (section 4) —
  health check confirms reachability, but only real playback confirms the
  manifest's variants actually play.

### C. What health check does NOT catch
- Geo-blocked sources that pass from Railway's region but fail for your users.
- Sources that allow the manifest but throttle video segments under load.
- Audio/video sync or codec issues. Always do one real playback test per source
  provider.

---

## 4. Testing playback

Free channels need only a logged-in account. Premium channels need an **active
subscription** on the test account.

### Browser (customer dashboard)
1. Sign in at `APP/login`.
2. On the dashboard, click a channel card → the player modal opens.
3. Expected: video plays within a few seconds.
4. Error states tell you what's wrong:
   - **"No stream available"** → channel has no active stream (load one).
   - **"Subscription required"** → premium channel, account has no active sub.
   - **"Playback error / stream may be offline"** → source is down or not HLS.

### VLC
1. Get your M3U URL: dashboard → **M3U Playlist** card (copies the URL), or
   `GET $API/users/playlist-token`.
2. VLC → **File → Open Network Stream** → paste the `.m3u` URL → Play.
   (Or download the file and open it.)
3. The playlist shows only channels that account can access.

### TiViMate
1. TiViMate → **Settings → Playlists → Add playlist → Enter URL**.
2. Paste the M3U URL → name it → save.
3. Channels populate; open one to test. Re-sync the playlist after you add
   channels/streams.

### IPTV Smarters (Pro)
1. Choose **Login with Xtream Codes API** is NOT used here — choose
   **Load Your Playlist or File / Add M3U URL**.
2. Paste the M3U URL → add → open a channel.

> The same M3U URL works in all three players. If a URL leaks, rotate it:
> `POST $API/users/playlist-token/rotate` (the old URL stops working).

---

## 5. First-day launch checklist

**Infrastructure**
- [ ] Backend service is **green** on Railway; latest deploy is the intended commit.
- [ ] Frontend service is **green**; domain resolves over HTTPS.
- [ ] Database migrations applied (startup runs `migrate deploy`).
- [ ] Required env vars set: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`,
      `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL`,
      `ALLOWED_ORIGINS`, (`PUBLIC_API_URL` recommended for M3U URLs).
- [ ] Backend did **not** exit on boot from a missing webhook secret or a paid
      package missing a Stripe price id (check logs).

**Payments (Stripe, live mode)**
- [ ] Every active paid package has a live `stripePriceId`.
- [ ] Webhook endpoint is registered in Stripe and pointing at
      `$API/payments/webhook`, signing secret matches `STRIPE_WEBHOOK_SECRET`.
- [ ] Do **one real** end-to-end paid checkout with a real card → confirm the
      subscription flips to `ACTIVE` and a premium channel becomes playable.
- [ ] Cancel that test subscription and confirm it cancels in Stripe + DB.

**Content**
- [ ] Streams loaded for the channels you're advertising.
- [ ] Health check run; broken streams disabled.
- [ ] At least one free and one premium channel verified playing in the browser.
- [ ] M3U URL verified in at least VLC + one mobile player.

**Accounts & access**
- [ ] Admin account exists and can reach `/admin`.
- [ ] A fresh customer can register, log in, subscribe (free + paid), and watch.
- [ ] Free plan shows the advertised free channel count.

**Comms**
- [ ] Support email / contact page works.
- [ ] Terms & Privacy pages reachable.
- [ ] You can see Railway logs in real time for the first hours.

---

## 6. Disaster recovery — streams failing

Symptom: customers report a channel (or many) won't play.

**Triage (first 5 minutes)**
1. Reproduce in the browser dashboard — note the exact error state.
2. Run **Admin → Streams → Health Check** to see scope: one channel, one source
   provider, or everything.

**If ONE channel is down**
- Confirm it has an active stream; if the source is dead, switch to a backup:
  disable the primary stream (toggle Active off) so the higher-priority backup
  serves, or import/add a new URL.

**If MANY channels from the SAME source are down**
- The upstream provider is failing or has blocked Railway's IP/region. Use
  **Check & Disable Broken** to take them out of rotation so customers see a
  clean "no stream" message instead of a spinner, then swap to an alternate
  provider via CSV re-import.

**If ALL playback is down but health checks pass from the server**
- Likely a client-side / CORS / region issue, not the source. Check:
  - Did a recent deploy change `ALLOWED_ORIGINS` or the API URL?
  - Is the backend up (`/health` or any API call returning 200)?
  - Is it geo-blocking (works from server region, fails for users)?

**If the backend itself is down**
- Check Railway → backend logs for a boot-time `FATAL:` (missing env var, missing
  Stripe price id) or a crash loop. Roll back to the last known-good deploy from
  the Railway deployments list.

**If the database is unreachable**
- Check Railway Postgres status. The app exits on failed DB connect; once the DB
  is back, redeploy/restart the backend. Verify the latest automated DB backup
  exists before doing anything destructive.

**Communicate**
- Post a short status note (banner/email) if an outage exceeds a few minutes.
  Customers tolerate a known issue far better than silence.

---

## 7. Monitoring checklist

### Stripe
- [ ] **Webhooks**: Stripe Dashboard → Developers → Webhooks → delivery success
      rate. Investigate any spike in failed deliveries (your endpoint returning
      non-200 means it will retry; the `webhook_events` table dedupes replays).
- [ ] **Failed payments**: watch `invoice.payment_failed` volume — these flip
      subscriptions to `EXPIRED`.
- [ ] **Disputes/chargebacks**: review weekly.
- [ ] **Payout schedule**: confirm payouts are landing.

### Database
- [ ] Connection errors / pool exhaustion in backend logs (tune
      `?connection_limit=` in `DATABASE_URL` if you see pool timeouts).
- [ ] Disk usage trending up on the Postgres instance.
- [ ] Automated backups exist and are recent. Periodically test a restore.
- [ ] Slow queries if dashboards feel sluggish.

### Stream health
- [ ] Run **Health Check** at least daily during the first weeks (and after any
      bulk import).
- [ ] Track which source providers fail most; drop unreliable ones.
- [ ] Watch for sources that pass health but get throttled at peak hours.

### Railway
- [ ] Both services **green**; no crash-restart loop.
- [ ] CPU / memory headroom on backend and DB.
- [ ] Deploy history — know your last known-good commit for fast rollback.
- [ ] Logs streaming and readable; set log-based alerts if available.
- [ ] Custom domains + TLS certs valid (not near expiry).

---

## 8. Top 10 things most likely to break in week one

1. **Dead/throttled stream sources.** The most common failure by far — upstream
   providers go down, rate-limit, or block the server's region. Mitigate with
   backups (priority) + daily health checks + disable-broken.
2. **Stripe webhook misconfiguration.** Wrong signing secret or wrong URL means
   paid customers pay but never get activated. Verify with one real checkout.
3. **Premium gating surprises.** A channel marked premium that you meant to be
   free (or vice-versa) → customers either can't watch or get it for free. Audit
   the `isPremium` flags.
4. **Database connection pool exhaustion** under concurrent load — dashboards
   time out. Raise `connection_limit` or add PgBouncer.
5. **CORS / API URL drift after a redeploy.** Frontend suddenly can't reach the
   API. Keep `ALLOWED_ORIGINS` and `NEXT_PUBLIC_API_URL` consistent.
6. **Backend refusing to boot** on a `FATAL:` guard (missing `STRIPE_WEBHOOK_
   SECRET`, missing price id on an active paid package). Check logs after every
   deploy.
7. **M3U URL issues in players.** Wrong base URL (set `PUBLIC_API_URL`), or a
   user rotated/leaked their token. Confirm the URL in VLC before blaming the
   player.
8. **Subscription expiry edge cases.** A sub that expired mid-session still
   appears active in a stale UI; or `invoice.payment_failed` flips someone to
   `EXPIRED` unexpectedly. Verify the expiry/renewal flow.
9. **Password reset / email gaps.** Reset endpoints exist but email delivery may
   not be wired — locked-out users generate support load. Have a manual path.
10. **Scale shock at peak.** Single Railway replica + single-source streams
    strain at a few hundred concurrent viewers. Know how to scale replicas and
    which sources are CDN-backed before your busiest hour.
