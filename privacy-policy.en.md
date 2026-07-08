# RunApp Privacy Policy

**Last updated: [2026-07-08]**

We, [Ivan avtaikin] (hereinafter "RunApp", "we"), value your privacy. This
document explains what data we collect when you use the RunApp mobile
application, why, and how we manage it.

If anything is unclear or you need help, contact us at **[kaizerakafollen+runapp@gmail.com]**.

---

## 1. Who we are

RunApp is a fitness app with gamification, where you record walks, runs
and bike rides, capture territory on an H3-hexagon map, compete on the
leaderboard, and chat in clans.

Data controller: **[Ivan Avtaikin]**, jurisdiction: **[Russian Federation]**.

## 2. Data we collect

### 2.1 Account data (required)

- **Email** — for login and account recovery
- **Nickname** — displayed on the leaderboard, chat, and map
- **Password** — we store only the bcrypt hash; we never see the original
- **Registration date and Terms of Service acceptance timestamp**

### 2.2 In-app data (during use)

- **Activity data**: distance, duration, average speed, activity type
  (walk/run/bike), GPS point tracks at ~5m resolution
- **H3 hexagons**: which territory cells you have "captured"
- **In-game economy**: earned coins, purchases in the cosmetics shop
- **Level, XP, achievements**: aggregated statistics
- **Clans**: membership, role, posts in the clan feed, messages in the clan chat
- **Preferences**: chat theme, sound, cell color, nickname

### 2.3 Device sensor data (with your permission)

- **CoreLocation (GPS)** — coordinates, speed, altitude during activity.
  Runs in background while recording — this is documented in the "Always"
  permission. GPS is not requested when no activity is in progress.
- **HealthKit** (with your consent) — steps, walking/running distance,
  floors, active minutes, calories. Only during activity periods.

### 2.4 Technical data

- **IP address** — for rate limiting on login attempts (bruteforce protection)
- **Device**: model, iOS version, locale (for localization and version stats)
- **Refresh tokens** — SHA-256 hashed in DB (not raw), 30-day TTL

### 2.5 What we do NOT collect

- Contacts, calendar, microphone, camera, photos
- Precise location outside of active activity
- Data about visited websites or use of other apps
- Financial information (we have no real payments — only in-game coins)

## 3. Why we need this data

- **App functionality**: authentication, activity recording, coin/XP
  crediting, map rendering
- **Social features**: leaderboard, clan chat, clan feed
- **Moderation**: reviewing content reports, enforcing blocks
- **Anti-fraud/anti-cheat**: server-side activity validation, GPS spoofing
  detection
- **App improvement**: understanding which features work, catching bugs
- **Security**: rate limiting, suspicious activity detection

We **do not use your data for advertising** and do not sell it to third parties.

## 4. Who we share data with

- **Apple** (unavoidable) — HealthKit data is processed through Apple APIs;
  diagnostic crash reports via Xcode Organizer
- **Railway.app** — our cloud hosting (US / EU instances). PostgreSQL DB
  and Go server logs
- **Sentry** *(if enabled)* — crash reports and errors (without PII)

All transfers use HTTPS/TLS 1.2+. We **do not sell** data to advertisers.

## 5. Where we store data

- **iOS Keychain** (device-only): JWT access token and refresh token
- **iOS UserDefaults**: nickname and email cache for offline mode (not
  security-critical)
- **SwiftData** (local on device): activity history, captured cells, coin
  transactions
- **PostgreSQL on Railway**: server-side records of all your data

TLS is used for all network communication.

## 6. How long we retain data

- **Account** — until you delete it (see section 8)
- **Refresh tokens** — 30 days, automatically deleted 7 days after expiry
- **Server request logs** — up to 90 days
- **Deleted accounts** — wiped immediately (DB CASCADE), including
  activities, posts, messages, and transactions

## 7. Your rights

### 7.1 Access

You can obtain your data:
- In-app: "History", "Wallet", "Achievements" screens show it all
- Request a machine-readable export — email **[kaizerakafollen+runapp@gmail.com]**

### 7.2 Modification

- Nickname, color, theme, preferences — in the Profile section
- Email — only via support at **[kaizerakafollen+runapp@gmail.com]** for now

### 7.3 Deletion (right to be forgotten)

**In-app**: Profile → Account → "Delete Account". Data is wiped immediately
and irreversibly (`DELETE /me` with CASCADE).

If this doesn't work — email **[kaizerakafollen+runapp@gmail.com]** and we'll delete manually
within 7 days.

### 7.4 Withdrawal of consent

You can revoke HealthKit or Location access at any time in iOS Settings →
RunApp. The app will continue to work without these, but some features
will be limited.

## 8. Children

RunApp is intended for users **over 13 years old** (per COPPA / GDPR
Article 8). We do not knowingly collect data from children under 13. If
you are a parent and learn your child registered, email
**[kaizerakafollen+runapp@gmail.com]** — we will delete the account.

## 9. International data transfers

Data may be stored on servers outside your country:
- Primary hosting: **Railway.app** (US / EU regions)
- Apple infrastructure: global

We take measures (encryption in transit, restricted access) to protect
data regardless of storage jurisdiction.

**For EU users**: our agreements with Railway include Standard Contractual
Clauses (SCCs) for transfers outside the EEA.

## 10. Security

- Passwords — bcrypt cost 10
- Tokens — SHA-256 hashed before storage in DB
- HTTPS with modern TLS protocols for all network activity
- Rate limiting on login and purchases to protect against bruteforce/spam
- Regular dependency updates

No system offers 100% guarantees. If you suspect your account is
compromised — email **[kaizerakafollen+runapp@gmail.com]** immediately.

## 11. Changes to this policy

If we substantially change the policy (new data types, new recipients), we
will notify you:
- Push notification
- A screen at next launch requiring you to re-read and accept

Last-updated date is at the top of the document.

## 12. Contact us

For any questions about your data or this policy:

**Email**: [kaizerakafollen+runapp@gmail.com]

We respond within 24-48 hours on business days. For GDPR/CCPA requests —
within 30 days (as required by law).
