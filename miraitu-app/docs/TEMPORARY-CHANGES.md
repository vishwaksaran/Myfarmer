# Temporary changes — hidden features and how to restore them

Everything listed here was **hidden on purpose**, not deleted. No component,
route, database table or piece of logic was removed — each entry is a switch
that can be flipped back. Work through this file when it is time to bring a
feature back.

Anything **not** in this list is a permanent change and should not be reverted.

Last updated: 2026-09-04

---

## Quick status

| # | What is hidden | Where the switch lives | Restore effort |
|---|----------------|------------------------|----------------|
| 1 | 10 service cards on Our Services | `src/app/home/services/page.tsx` | delete lines from a Set |
| 2 | Cart icon in the header | `src/components/v2/Header.tsx` | one boolean |
| 3 | Finance + Shop in header nav (desktop & mobile) | `src/components/v2/Header.tsx` | uncomment 2 lines |
| 4 | Shop slot in the mobile bottom nav (shows Community) | `src/components/v2/BottomNav.tsx` | swap 1 line |
| 5 | Farmer Finance Services banner (home) | `src/app/page.tsx` | uncomment 2 lines |
| 6 | Shop for Your Farm section (home) | `src/app/page.tsx` | uncomment 2 lines |
| 7 | Watch Farmer Stories videos (home) | `src/app/page.tsx` | uncomment 2 lines |
| 8 | Add-to-Cart across all shop pages | `src/lib/feature-flags.ts` | one boolean |
| 9 | New + Rent actions across machinery | `src/lib/feature-flags.ts` | two booleans |
| 10 | New + Rent tabs on Small Machineries | `src/app/home/machinery/small-machineries/page.tsx` | uncomment 2 lines |
| 11 | Tractors landing page (card opens the modal instead) | `src/app/home/machinery/page.tsx` | re-add a branch |
| 12 | Every form's success message (now "not operating in your area") | `src/lib/service-availability.ts` + `src/i18n/pageContent.ts` | 2 strings × 10 languages, or restore per-form copy below |
| 13 | First-run language chooser (header translate button kept) | `src/lib/feature-flags.ts` | one boolean |

---

## 1. Ten service cards hidden from "Our Services"

**File:** `src/app/home/services/page.tsx`

A `hiddenServices` Set filters the grid. Currently hidden:

Rent Machinery · CCTV Installation · Fencing Services · Farm Labours ·
Transportation · Storage and Godown · Plumber · Electrician · Mechanic ·
Milk Vendors

**Restore:** delete a name from the Set to bring that one card back, or delete
the whole Set and its use in the `ourServices` filter to restore all ten.

**Note:** the service pages and routes (e.g. `/home/services/plumber`) still
exist and are reachable by direct URL — only the grid tiles are hidden.

---

## 2. Cart icon hidden from the header

**File:** `src/components/v2/Header.tsx`

```ts
const SHOW_CART = false;   // ← set to true to restore
```

The cart button and its item-count badge return immediately. The cart context
and `/home/shop/checkout` were never touched.

> History: this slot briefly held a Community shortcut. That was removed once
> Community moved into the mobile bottom nav (#4). If you restore the cart you
> do not need to do anything else here.

---

## 3. Finance and Shop removed from the header nav

**File:** `src/components/v2/Header.tsx` → `primaryNavItems`

This one array drives **both** the desktop nav bar and the mobile hamburger
menu, so restoring it fixes both at once. The two removed entries are kept as
comments directly above the array:

```ts
// { tKey: 'nav.finance', path: '/home/finance', icon: 'account_balance' },
// { tKey: 'nav.shop', path: '/home/shop', icon: 'shopping_bag' },
```

**Restore:** uncomment and move them back into the array (Finance and Shop sat
after Livestock).

---

## 4. Mobile bottom nav: Shop replaced by Community

**File:** `src/components/v2/BottomNav.tsx` → `baseNavItems`

The 4th slot now holds Community. The original line is in the comment above the
array:

```ts
{ label: 'Shop', tKey: 'bottomNav.shop', icon: 'shopping_bag', path: '/home/shop' }
```

**Restore:** swap the Community entry back for that line. If you want to keep
both, note the bar only has room for 5 slots at 320px — adding a 6th will
overflow.

---

## 5–7. Home page sections hidden

**File:** `src/app/page.tsx`

Three sections are commented out in two places each — the `dynamic()` import
near the top, and the tag inside `<main>`:

| Section | Component |
|---------|-----------|
| Farmer Finance Services banner | `FinanceBanner` |
| Shop for Your Farm / AGRI STORE | `ShopSection` |
| Watch Farmer Stories (SUCCESS STORIES) | `FeaturedVideosSection` |

**Restore:** uncomment the import and the tag for whichever section you want
back. The component files themselves are unchanged.

---

## 8. Shop is browse-only (no Add to Cart)

**File:** `src/lib/feature-flags.ts`

```ts
export const SHOP_CART_ENABLED = false;   // ← set to true to restore
```

Gates the Add-to-Cart button and the quantity stepper on all five shop
surfaces:

- `src/app/home/shop/page.tsx`
- `src/app/home/shop/all/page.tsx`
- `src/app/home/shop/wishlist/page.tsx`
- `src/app/home/shop/[category]/CategoryPageClient.tsx`
- `src/app/home/shop/solar-dry-products/ralos/RalosBrandPage.tsx`

Browsing, prices, wishlist hearts and product pages all still work. The
**services** cart (`/home/services/cart`) is a separate system and was
deliberately left working — service booking depends on it.

⚠️ **Known gap:** `/home/shop/checkout` is still reachable by direct URL. With
no way to add items it shows an empty cart, but anyone with items left in
localStorage from before could still check out. Block the route too if that
matters.

---

## 9. New and Rent actions hidden across machinery

**File:** `src/lib/feature-flags.ts`

```ts
export const MACHINERY_NEW_ENABLED: boolean = false;    // ← set to true to restore
export const MACHINERY_RENT_ENABLED: boolean = false;   // ← set to true to restore
```

Two consumers, so one flip fixes both:

- `src/app/home/machinery/page.tsx` — the category action modal (Tractors, JCB,
  Implements, Harvesters, Drones…) now offers only **Buy Used** and **Sell Used**
- `src/components/v2/machinery/MachinerySubNav.tsx` — the tab strip on every
  category sub-page

The `/new` and `/rent` routes still exist and work by direct URL.

⚠️ **Do not change the `: boolean` annotation.** A bare `= false` gives the
constant the literal type `false`, which makes TypeScript treat the guarded JSX
as unreachable and drop the null-narrowing on `modalCategory` — that produces
six `possibly 'null'` errors in the machinery page.

---

## 10. Small Machineries: New and Rent tabs hidden

**File:** `src/app/home/machinery/small-machineries/page.tsx`

This page has its own tab bar rather than the shared `MachinerySubNav`, so it
needed a separate change. Both entries are commented out inside `tabs`.

**Restore:** uncomment the `new` and `rent` entries. Then also revert these two
follow-on changes made because only two tabs remained:

- default tab is `'buy'` — was `'new'`
- the grid is `grid-cols-2` with `sm:grid-cols-4` applied only when
  `tabs.length > 2`; with four tabs back it behaves as it originally did, so no
  edit is strictly required there

---

## 11. Tractors card opens the modal instead of its landing page

**File:** `src/app/home/machinery/page.tsx`

There used to be an `if (category.id === 'tractors')` branch that rendered the
card as a `<Link>` straight to `/home/machinery/tractors`, bypassing the action
modal. It was removed so Tractors behaves like JCB.

**Restore:** re-add a `<Link href={category.path}>` branch for `tractors` at the
top of the `categories.map(...)` callback, using the same card markup as the
`<button>` branch below it.

⚠️ **The `/home/machinery/tractors` page was NOT removed.** It is still live and
still linked from:

- `src/app/sitemap.ts` (lines ~12-16 and ~43) — still submitted to search engines
- `src/components/v2/machinery/HeroSearch.tsx` — brand/model search results
- `BrandLogoGrid.tsx`, `ComparisonCards.tsx`, `BudgetFilter.tsx`,
  `SeriesShowcase.tsx` — brand, model-detail and compare deep links

If the page needs to be genuinely unreachable, add a redirect to
`/home/machinery` and remove those sitemap entries — but that takes real model
and brand content offline, so decide deliberately.

---

## 12. All form success cards replaced with a "not serviceable in your area" notice

**File:** `src/lib/service-availability.ts`

Every form in the app used to confirm a submission in its own words and promise
a callback. While Miraitu is not operating in the farmer's area, all seventeen
now show one shared message instead:

```ts
export type SubmissionKind = 'booking' | 'request';

export const SUBMISSION_HEADINGS: Record<SubmissionKind, string> = {
    booking: 'Booking Not Confirmed',
    request: 'Request Not Confirmed',
};

export const SUBMISSION_BADGE = 'Not serviceable in your area';

export const SUBMISSION_MESSAGE =
    'We have your details, but Miraitu does not operate in your area yet, so we could not confirm this. We will get in touch as soon as we start serving your area. Thank you for your interest.';

// The card's visual treatment — amber, and a struck-through location pin.
export const SUBMISSION_ICON = 'wrong_location';
export const SUBMISSION_ACCENT = { circle: …, icon: …, badge: … };
```

The first version of this notice opened with **"Thank You"** over a green tick,
which read as a confirmed booking — the farmer had to reach the third sentence
before learning nothing had been booked. The heading now carries the outcome,
a badge under it carries the reason, the tick is gone, and the thanks moved to
the end of the message where it no longer contradicts the news.

Each call site passes the noun that fits it: `useSubmissionCopy('booking')` for
the carts, service pages and site visits; `useSubmissionCopy('request')` for
listings, applications and memberships. The default is `'request'`.

**Nothing about submission changed.** Every form still validates, still saves
the lead to Supabase, and still reaches Admin → Bookings. Only the words after
the submit are different, and the "📞 Our team will contact you…" badges are
hidden.

All four strings are translated into all nine other languages — see
"The notice is translated in all ten languages" below.

**Restore, the quick way:** put the old wording back into these constants **and
their matching keys in `src/i18n/pageContent.ts`**, and restore each card's
green tick by swapping `SUBMISSION_ICON` / `SUBMISSION_ACCENT` back for the
`check_circle` and gradient each card used to carry (they are in git history —
the commit that introduced this entry's second revision). That gives every form
one shared, honest confirmation — but a generic one.

**Restore, the faithful way:** each form's original copy is below. Replace
`{SUBMISSION_HEADING}` / `{SUBMISSION_MESSAGE}` in that file with the text
shown, and re-add the badge line where one is listed. Note that several of
these were near-duplicates of each other — worth consolidating deliberately
rather than restoring all seventeen verbatim.

### Land forms

| File | Heading | Body | Also removed |
|---|---|---|---|
| `home/land/sell/page.tsx` | Land Listing Submitted! | Your land listing has been submitted successfully. Our team will review it and contact you soon with verified buyer matches. | subline "Great job! 🚀"; green badge "📞 Our team will contact you shortly" |
| `home/land/rent/page.tsx` | Rental Listing Created! | Your land rental listing has been submitted successfully. Our team will connect you with interested farmers looking for land to rent. | subline "Awesome! 🎉"; amber badge "📞 Our team will contact you shortly" |
| `home/land/lease/page.tsx` | Listing Submitted! | Your land lease listing has been submitted. Our team will review and publish it within 24 hours. Once approved, it will appear in the Browse tab for all farmers to see. | subline "Under Review 🌟"; teal badge "📞 Our team will contact you shortly" |

### Service booking pages

| File | Heading | Body | Also removed |
|---|---|---|---|
| `home/borewell/page.tsx` | Consultation Booked! | Your borewell consultation request has been submitted successfully. | badge "📞 Our team will contact you soon to schedule your visit" |
| `home/cctv/page.tsx` | Thanks for Applying! | Your CCTV installation request has been submitted successfully. | second line "Our team will contact you within **48 hours** to finalize your installation." |
| `home/fencing/page.tsx` | Quote Requested! | Your fencing quote request has been submitted successfully. | badge "📞 Our team will contact you soon to finalize your fencing installation" |
| `home/protection/page.tsx` | Quote Requested! | Your protection sheet quotation request has been submitted successfully. | badge "📞 Our team will contact you soon with customized solutions" |
| `home/services/soil-testing/page.tsx` | Visit Scheduled! | Your soil testing request has been submitted successfully. | badge "📞 Our team will contact you soon to schedule the soil sample collection" |
| `home/services/storage-godown/page.tsx` | Booking Request Sent! | Thank you, **{name}**! Your storage booking for {item} has been received. | support-agent row "Our team will reach you within 24 hours at {phone}." |
| `home/services/rent-machinery/page.tsx` | Booking Request Sent! | Thank you, **{name}**! Your rental request for {item} has been received. | support-agent row "Our team will reach you within 24 hours at {phone}." |
| `home/services/[slug]/ServicePageClient.tsx` | Booking Submitted! | Your {item} booking request has been submitted successfully. | badge "📞 Our team will contact you soon to connect with verified providers" |

`ServicePageClient` is the shared template behind **every other service page**,
so restoring it restores all of them at once. All strings above were wrapped in
`tp(...)` except CCTV and Protection, which were hardcoded English.

### Listing and application forms

| File | Heading | Body | Also removed |
|---|---|---|---|
| `components/v2/machinery/SellMachineryForm.tsx` | Machinery Listed Successfully! | Your machinery listing has been submitted for review. Our team will verify the details and connect you with interested buyers. | subline "Great job! 🚜"; badge "📞 Our team will contact you soon" |
| `home/crops/sell/list/page.tsx` | Crop Listed! | Your produce has been listed successfully. Buyers can now find it in the marketplace. | — |
| `home/become-seller/page.tsx` | Application Submitted! 🎉 | Congratulations! Your **{sellerLabel}** application has been received. | second line "Miraitu team will verify your details and contact you within **24 hours**. 📞" |
| `home/finance/loan/page.tsx` | Application Submitted! | Our team will contact you within 24 hours. | — |

The become-seller modal **kept** its "Verification Pending / Dashboard Ready"
tiles and its "Go to Your Dashboard" button — the seller account really is
created, so removing those would break a working flow.

### Cart checkouts

| File | Heading | Body |
|---|---|---|
| `home/machinery/cart/page.tsx` | Booking Created! | Your rental request has been saved. You can track or cancel it anytime from My Bookings. |
| `home/services/cart/page.tsx` | `t('cart.bookingCreated')` | `t('cart.bookingCreatedDesc')` |

Both still create a real booking, and the machinery cart still shows its
"View My Bookings" button below the new message.

### The three that were translated

These read from i18n keys rather than inline text. The keys are **untouched and
still populated in all eight languages** — restoring means pointing the JSX back
at `t(...)` instead of the constants:

| File | Heading key | Body key | Also removed |
|---|---|---|---|
| `home/services/fpo/page.tsx` | `fpo.consultationBooked` | `fpo.consultationDesc` | — |
| `components/v2/VeterinarySection.tsx` | `vet.bookingConfirmed` | `vet.bookingDesc` | badge `vet.teamContact` |
| `components/v2/ToolboxSection.tsx` | `toolboxSection.bookingConfirmed` | `toolboxSection.bookingConfirmedDesc` | footer row `toolboxSection.confirmationSent` |

These three lose nothing: the new notice is translated too (see below), so they
still read in the farmer's language — just from a different dictionary.

### The notice is translated in all ten languages

All four strings live in `src/i18n/pageContent.ts`, keyed by their English text,
alongside every other page string:

- `'Booking Not Confirmed'`
- `'Request Not Confirmed'`
- `'Not serviceable in your area'`
- `'We have your details, but Miraitu does not operate in your area yet, …'`

Each carries `hi, mr, gu, te, ta, kn, pa, bn, ml` — Hindi, Marathi, Gujarati,
Telugu, Tamil, Kannada, Punjabi, Bengali and Malayalam — with English as the
source key.

⚠️ **The key must match `SUBMISSION_MESSAGE` byte for byte**, including the
curly apostrophe in "we’re" (U+2019, not `'`). `translatePage()` looks the
string up by its English text, so a single changed character silently drops
every language back to English with no error. If you edit the wording, edit the
dictionary key in the same commit.

Because several forms (the land forms, CCTV, the carts, the loan application)
had no `tp` of their own, the constants are read through a hook —
`useSubmissionCopy()` in `src/lib/service-availability.ts` — which returns
`{ heading, message }` already translated. Every form calls that; none reads
the raw constants. The constants stay exported because they are the dictionary
keys and the English source of truth.

### Two places still promising contact

Deliberately left alone, because they appear **before** the user submits, not
after — but they now contradict the new message and should be revisited:

- `src/app/home/cctv/page.tsx` (~line 247) — "Fill in your details and our
  expert will contact you within 24 hours"
- `src/app/home/machinery/cart/page.tsx` (~line 240) — "*Once you create the
  booking, our team will reach out to confirm. You can cancel it anytime from
  My Bookings."

The Buy & Sell and Rent boards were also left alone: their banner
("Post an Ad — published") publishes a listing live rather than generating a
lead, so the not-operating notice does not apply.

---

## 13. First-run language chooser hidden

**File:** `src/lib/feature-flags.ts` — `LANGUAGE_FIRST_RUN_ENABLED`

On a new device the app used to open the language chooser once, before the user
reached anything else, and make them pick one of ten languages. It is switched
off because the translation coverage does not yet back the promise: the header,
bottom nav and home sections are translated, but the marketplace pages a farmer
actually lands on are not. An audit on 2026-09-04 found roughly 2,841 hardcoded
English strings across 198 files, including:

| Area | Files | ~Strings |
|------|-------|----------|
| Rent + Buy & Sell (`src/components/listings/`) | 4 | ~37 |
| Machinery buy/sell/rent/new | 39 | ~587 |
| Livestock | 10 | ~267 |
| Land | 4 | ~124 |
| Orders / Profile / Reels / Dashboard | 4 | ~64 |

Choosing Telugu therefore produced a Telugu nav over English content, which
reads worse than staying in English.

**Deliberately still available:** the translate button in the header. Anyone who
wants another language can still switch; they are simply no longer asked on
first launch. The header modal was left alone on purpose.

**To restore:** flip `LANGUAGE_FIRST_RUN_ENABLED` to `true`. The component, its
copy in all ten languages, the splash hand-off in `src/lib/splash.ts` and the
`miraitu-lang-onboarded` localStorage flag are all untouched.

Note that devices which already answered the chooser carry
`miraitu-lang-onboarded` in localStorage and would not be asked again anyway —
clear the site's storage to test a restore.

---

## Not temporary — do not revert

These were built or fixed in the same period and are meant to stay:

- **Buy Land is database-driven** — `fetchApprovedSellListings()` in
  `src/app/actions/bookings.ts`, consumed by `src/app/home/land/buy/page.tsx`.
  Publish a listing from Admin → Bookings (status `confirmed`, or the **Publish**
  button). The six showcase listings at the top of the grid are the
  `DEMO_LISTINGS` array in that page — delete it to show only real listings.
- **Sell-form photo upload** — photos now reach Supabase Storage and appear on
  the listing card, with a lightbox for all of them.
- **Contact tracking** — `src/app/actions/listing-contact.ts` logs Call and
  WhatsApp taps to Admin → Activity Log.
- **Admin bookings per-column filters** and the category-chip fix.
- **Price `₹NaN` fix** — `formatPrice()` in the lease page plus numeric
  validation on the lease and rent forms.
- **Land Area full-screen map** — including the `body.map-fullscreen` CSS in
  `src/app/home/globals-v2.css` that hides app chrome, and the place-search
  fallback shown when geolocation is denied.
- **Bottom nav 320px fix** — flex-1 slots and the responsive font sizes.
- **Lease/Rent card selector** on `/home/land/lease`.
- **CIN in the footer.**
