# AdSense rollout

Phase 1 scaffolding is in place and **inert**. Nothing renders, and no Google
script is downloaded, until both switches below are on.

Scope: **India only**. See the consent note at the bottom before serving any
EEA/UK traffic.

## The two switches

| Switch | Where | Current |
|---|---|---|
| `ADS_ENABLED` | `src/lib/feature-flags.ts` | `false` |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | environment | unset |

Both must be set, and the client ID must start with `ca-pub-`. Any other
combination returns `adsConfigured() === false` and the whole ads layer stays
dark — a half-configured deploy fails closed rather than shipping empty boxes.

## What was built

| File | Role |
|---|---|
| `src/lib/ads-config.ts` | Publisher ID, slot IDs, route allow/block policy |
| `src/lib/ad-consent.ts` | Consent storage, withdrawal, change event |
| `src/components/ads/AdSenseLoader.tsx` | Loads the AdSense library, `lazyOnload`, consent- and route-gated |
| `src/components/ads/AdUnit.tsx` | One ad slot, height reserved, labelled |
| `src/components/ads/AdConsentBanner.tsx` | DPDP notice, shown once per device |
| `src/components/settings/AdPreferencesSettings.tsx` | Withdraw / re-grant consent |
| `src/i18n/adsTranslations.ts` | Label + consent copy in all 10 languages |

Also: an "Advertising Cookies" section in the privacy policy, and the AdSense
variables in `.env.local.example`.

## Route policy

Ads are **allowlisted**, so every route added in future is ad-free by default.
A blocklist overrides the allowlist for transaction-sensitive subtrees inside
otherwise ad-eligible sections.

Allowed: `/marketplace`, `/home/livestock`, `/home/machinery`, `/home/crops`,
`/home/land`, `/home/community`.

Blocked even inside those: every `sell` route, `/home/machinery/cart`,
`/home/machinery/bookings`, `/home/services/cart`, `/home/shop/checkout`,
`/home/shop/wishlist`, plus all auth, admin, dashboard, onboarding, settings
and vendor surfaces.

Two things to know about this list:

- **`/articles` is deliberately absent** — that section does not exist yet.
  It is the intended high-density surface; marketplace pages should stay low
  density. Add the prefix when the section ships.
- **Two parallel trees exist** for the same categories (`/home/livestock` and
  `/marketplace/livestock`, likewise machinery). Both are listed. If one tree
  is retired, delete its prefixes rather than leaving a dead entry.

## Before turning it on

1. **AdSense approval is not a day-one step.** Approval needs substantial
   original content. A site that is almost entirely user-generated listings is
   a common "low value content" rejection. Building the articles section is
   realistically upstream of approval, not parallel to it.
2. Create the ad units in the AdSense dashboard and paste their IDs into the
   `NEXT_PUBLIC_ADSENSE_SLOT_*` variables. An empty slot ID renders nothing.
3. Place `<AdUnit slot="..." />` on the pages you want, starting with 1–2 per
   page. The component re-checks route eligibility itself, so pages do not
   repeat the policy.
4. Capture LCP / CLS / INP / TTFB **before** flipping the flag. Without a
   baseline the Phase 3 comparison has nothing to compare against.

## Performance notes

- `AdUnit` reserves its height before the iframe arrives, so a fill causes no
  layout shift. If a format's height is changed in the AdSense dashboard,
  change `AD_FORMATS` to match or the reservation silently stops working.
- The library loads with `strategy="lazyOnload"`. This keeps first render off
  the third-party critical path, at the cost of slightly later ad rendering.
  `afterInteractive` is the dial to turn if Phase 4 shows the delay costing
  revenue — measure before changing it.

## Consent

Declining does not remove ads; it switches them to non-personalised via
`data-npa="1"`. The banner copy and the privacy policy both say so, because
consent obtained on a false description is not informed consent.

**This is not a certified CMP.** For EEA/UK traffic Google requires a
Google-certified CMP, and a hand-rolled banner is non-compliant there no
matter how correct its logic. If Miraitu starts serving Europe, replace
`ad-consent.ts` and `AdConsentBanner.tsx` with a certified CMP rather than
extending them.

---

# Setting up the AdSense account

## Step 1 — Apply

1. Go to `adsense.google.com` and sign in with the Google account that should
   own the earnings. This is hard to change later — use a company account, not
   a personal one.
2. Site: `www.miraitu.in`. Country: India. Pick the payment currency now.
3. Accept the AdSense Terms.

## Step 2 — Verify the site

AdSense offers three methods. **Use the meta tag.**

Do *not* use the "paste the AdSense code snippet into `<head>`" option. That
method assumes the `adsbygoogle` library loads on every page, but
`AdSenseLoader` injects it only on ad-eligible routes after a consent choice —
and the homepage is not ad-eligible. A reviewer landing on `/` would find no
tag, and verification would fail.

The meta tag is already wired in `src/app/layout.tsx`. Set
`NEXT_PUBLIC_ADSENSE_CLIENT_ID` and deploy; it renders itself. It loads no
JavaScript, so it costs nothing on any Core Web Vital.

`/ads.txt` also starts serving from the same variable — no separate step.

## Step 3 — Payment profile

India specifics:

- The payee name must match the bank account and PAN exactly. A mismatch stalls
  the first payout, not the approval.
- At roughly $10 earned, Google mails a PIN to the registered address. Address
  verification cannot be completed until it arrives — allow several weeks.
- Payout threshold is $100. Nothing is paid before that.

## Step 4 — Wait for review

Days to weeks. Rejections are common and are usually about content, not code
(see the warning in "Before turning it on" above). If rejected, fix the cited
reason and reapply — repeated blind reapplication does not help.

## Step 5 — Configure brand safety BEFORE showing an ad

Do this while the flag is still `false`. Default AdSense serves whatever pays
best, which for an Indian farming audience includes dating, betting and
matrimonial ads.

AdSense dashboard → **Brand safety** → **Content** → **Blocking controls**.

Block the sensitive categories that do not belong next to farm equipment:
sexual and suggestive content, dating, gambling and betting, alcohol, tobacco,
drugs and supplements, weapons, astrology and the occult, cosmetic procedures,
"get rich quick" schemes, and religion- or politics-sensitive advertising.

Then narrow the general/advertiser categories to what a farmer would plausibly
want — agriculture, vehicles, business services, finance — and block the rest.

Two more controls in the same area:

- **Advertiser URLs** — block competitor domains by hand.
- **Ad review centre** — individual creatives, reviewable after traffic starts.
  Check it weekly for the first month.

Every block costs fill, and therefore revenue. That trade is worth making here:
one betting ad beside a tractor listing does more brand damage than the blocked
inventory was worth.

## Step 6 — Create ad units

Create the units, paste their IDs into the `NEXT_PUBLIC_ADSENSE_SLOT_*`
variables, then place `<AdUnit slot="..." />` on the chosen pages.

**Leave Auto Ads off.** Auto Ads inject placements dynamically, which defeats
the reserved-height boxes in `AdUnit` and reintroduces layout shift, and they
will place ads above the fold where Google's own page-layout algorithm demotes
ad-heavy pages. Manual placement is the reason the CLS story here holds.

Avoid anchor, sticky and vignette formats for the same reason. Vignettes are
full-page interstitials and carry real intrusive-interstitial risk.

## Step 7 — Baseline, then flip

Record LCP, CLS, INP and TTFB *before* enabling ads. Without a baseline the
Phase 3 comparison has nothing to compare against. Use field data from Search
Console's Core Web Vitals report as well as lab data from PageSpeed Insights —
they disagree, and the field data is what search actually uses.
