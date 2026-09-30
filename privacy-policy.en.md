# Runcell Privacy Policy

**Last updated: 29 September 2026**

We, Ivan Avtaikin (hereinafter "Runcell", "we"), value your privacy. This
document explains what data we collect when you use the Runcell mobile
application, why, and how we manage it.

If anything is unclear or you need help, contact us at
**kaizerakafollen@gmail.com**.

---

## 1. Who we are

Runcell is a fitness app with gamification, where you record walks, runs
and bike rides, capture territory on an H3-hexagon map, compete on the
leaderboard, and chat in clans.

Data controller: **Ivan Avtaikin**, jurisdiction: **Russian Federation**.

## 2. Data we collect

### 2.1 Account data (required)

- **Email** — for login and account recovery
- **Nickname** — displayed on the leaderboard, in chat, and on the map
- **Password** — we store only the bcrypt hash; we never see the original
- **Registration date and Terms of Service acceptance timestamp**

If you signed in with Apple, instead of a password we store:

- **Apple identifier** — a stable string Apple issues for our app. It is
  different for every other app, so it cannot be used to link you across
  services
- **Revocation token** — a service value we are required to keep in order
  to disconnect the app from your Apple ID when you delete your account.
  On its own it is useless: it only works together with our private key
- **Email** — either your real address or a relay address on
  `privaterelay.appleid.com` if you chose to hide it. It makes no
  difference to us; mail reaches both
- **First name** — only if you chose to share it. Used as a suggestion for
  your nickname and nowhere else

### 2.2 In-app data (during use)

- **Activity data**: distance, duration, average speed, activity type
  (walk/run/bike), GPS point tracks at ~5 m resolution
- **H3 hexagons**: which territory cells you captured and when
- **Territory transfer log**: which cell you took from whom, and who took
  one from you
- **In-game economy**: earned coins, purchases in the cosmetics shop
- **Level, XP, achievements**: aggregated statistics
- **Clans**: membership, role, posts in the clan feed, messages in the clan
  chat
- **Photos you attach yourself**: profile picture and photos in posts. They
  are uploaded only when you pick them — we do not scan your library
- **Reports and blocks**: who you reported and who you blocked — moderation
  is impossible without this
- **Preferences**: chat theme, sound, cell colour, nickname

### 2.3 Device sensor data (with your permission)

- **Location (CoreLocation)** — coordinates, speed and altitude during a
  walk. It keeps running in the background while a walk is being recorded,
  which is exactly why the "Always" permission is requested. No walk in
  progress — no location requested
- **HealthKit** (with your consent) — steps, walking and running distance,
  floors, active minutes, calories, **heart rate**. Only for the periods of
  your walks. If you ask us to count a workout recorded by another app, we
  read the route of that workout only — the one you picked
- **Camera and photo library** — only at the moment you choose an image for
  a post or your profile, and only the file you chose

**HealthKit data is not used for advertising and is not stored in iCloud.**
This is Apple's requirement and we comply with it.

### 2.4 Technical data

- **IP address** — for rate limiting on login attempts (bruteforce
  protection)
- **Device**: model, iOS version, locale (for localisation and version
  statistics)
- **Push notification device token** — to send you a notification about a
  finished walk or a group invitation
- **Refresh tokens** — stored as a SHA-256 hash, not the original, 30-day
  lifetime

### 2.5 What we do NOT collect

- Contacts, calendar, microphone
- The contents of your photo library — only the images you pick yourself
- Precise location outside of an active walk
- Data about websites you visit or your use of other apps
- Financial information — there are no real payments in the app, only
  in-game coins

## 3. Why we need this data

- **App functionality**: authentication, activity recording, coin and XP
  crediting, map rendering
- **Social features**: leaderboard, clan chat, clan feed
- **Moderation**: reviewing content reports, enforcing blocks
- **Anti-cheat**: server-side activity validation, GPS spoofing detection
- **App improvement**: understanding which features work, catching bugs
- **Security**: rate limiting, suspicious activity detection

We **do not use your data for advertising** and do not sell it to third
parties.

## 4. Who we share data with

- **Apple** (unavoidable) — HealthKit data is processed through Apple's
  APIs; with Sign in with Apple we contact Apple's servers to verify your
  token and to revoke access when you delete your account
- **Railway.app** — our cloud hosting (US / EU regions). PostgreSQL
  database and server logs
- **Resend** — transactional email delivery: password reset codes. Only the
  address and the message body are sent
- **Sentry** — crash and error reports from the app and the server. Your
  user identifier and nickname are sent; email, password and coordinates
  are not

All transfers use HTTPS with TLS 1.2 or above. We **do not sell** data to
advertisers.

## 5. Where we store data

- **iOS Keychain** (device only): access tokens
- **iOS UserDefaults**: nickname and email cache for offline mode
- **SwiftData** (local on device): activity history, captured cells, coin
  transactions
- **PostgreSQL on Railway**: server-side records of all your data

## 6. How long we retain data

- **Account** — until you delete it (see 7.3)
- **Refresh tokens** — 30 days, automatically deleted 7 days after expiry
- **Server request logs** — up to 90 days
- **Deleted accounts** — wiped immediately (database cascade), including
  activities, posts, messages, photos and transactions

## 7. Your rights

### 7.1 Access

You can obtain your data:

- In-app: the History, Wallet, Achievements and Territory History screens
  show all of it
- Request a machine-readable export — email
  **kaizerakafollen@gmail.com**

### 7.2 Modification

- Nickname, colour, theme, preferences — in the Profile section
- Email — via support only, for now

### 7.3 Deletion (right to be forgotten)

**In-app**: Profile → Settings → "Delete Account". Data is wiped
immediately and irreversibly.

If you signed in with Apple, deleting your account also revokes the app's
access to your Apple ID — Runcell disappears from the list in iOS Settings.
This is Apple's requirement and it happens automatically.

If deletion does not work for any reason — email
**kaizerakafollen@gmail.com** and we will delete your account
manually within 7 days.

### 7.4 Withdrawal of consent

You can revoke access to HealthKit, location, camera or photo library at
any time in iOS Settings → Runcell. The app will keep working without them,
but some features will be limited: without location you cannot record a
walk, without the photo library you cannot attach a picture.

## 8. Children

Runcell is intended for users **over 13 years old** (per COPPA and GDPR
Article 8). We do not knowingly collect data from children under 13. If you
are a parent and learn that your child registered, email
**kaizerakafollen@gmail.com** — we will delete the account.

## 9. International data transfers

Data may be stored on servers outside your country:

- Primary hosting: **Railway.app** (US / EU regions)
- Apple infrastructure: global

We take measures — encryption in transit, restricted access — to protect
data regardless of storage jurisdiction.

**For EU users**: our agreements with Railway include Standard Contractual
Clauses (SCCs) for transfers outside the EEA.

## 10. Security

- Passwords — bcrypt
- Tokens — hashed before storage in the database
- HTTPS with modern TLS versions for all network activity
- Rate limiting on login and purchases to protect against bruteforce and
  spam
- Regular dependency updates

No system offers 100% guarantees. If you suspect your account is
compromised — email **kaizerakafollen@gmail.com** immediately.

## 11. Changes to this policy

If we substantially change this policy — new data types or new recipients —
we will notify you:

- By push notification
- With a screen at next launch requiring you to re-read and accept

The last-updated date is at the top of the document.

## 12. Contact us

For any questions about your data or this policy:

**Email**: kaizerakafollen@gmail.com

We respond within 24–48 hours on business days. For GDPR and CCPA requests
— within 30 days, as required by law.
