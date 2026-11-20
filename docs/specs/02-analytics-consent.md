# 02 · Analytics notice and consent

Status: **spec, awaiting answers** · Size: **M** (about 3-4 h, plus a short privacy page) · Depends on: nothing

## Summary

Google Analytics (`G-ZT1Z6X8C7F`) currently loads for every visitor with no notice. Replace that with a quiet,
well-integrated notice that asks first, and load Google's script only after a "yes". A permanent "Privatliv" link
lets people change their mind at any time.

> Not legal advice. EU/Danish rules (ePrivacy, GDPR, the Danish cookie executive order) require consent before
> analytics cookies are set, and refusing must be as easy as accepting. Please have the final wording checked
> before launch if the site is run commercially.

## Goals

- Tell visitors plainly that analytics are used, why, and what they can do about it.
- Nothing from Google is requested, and no cookie is set, before consent.
- "Nej tak" is exactly as easy as "Det er fint".
- Feels like part of the site: same typography, warm colours and motion, not a grey modal.
- No layout shift, no impact on Largest Contentful Paint.

## Non-goals

- Ad personalisation or marketing consent (there are no ads).
- A consent-management platform or third-party banner script.

## UX

A compact card pinned to the bottom of the viewport. It never covers the page's main content area on desktop
and never blocks scrolling or reading.

```
Desktop (bottom-left, 380 px wide)           Phone (bottom sheet, full width minus 16 px gutters)
┌───────────────────────────────────┐        ┌──────────────────────────────────┐
│ 🍪  Må vi tælle besøg?             │        │ 🍪  Må vi tælle besøg?            │
│ Jeg bruger Google Analytics til at │        │ Jeg bruger Google Analytics til   │
│ se, hvilke opskrifter der bliver   │        │ at se, hvilke opskrifter der      │
│ læst. Ingen reklamer, intet salg   │        │ bliver læst. Ingen reklamer.      │
│ af data.   Læs mere                │        │ Læs mere                          │
│                                    │        │                                   │
│  [ Nej tak ]   [ Det er fint ]     │        │  [ Nej tak ]   [ Det er fint ]    │
└───────────────────────────────────┘        └──────────────────────────────────┘
```

- Appears about 1.5 s after first paint, sliding up and fading in (instant with reduced motion).
- Both buttons have the same size and weight; neither is pre-selected. "Nej tak" is not hidden in a link.
- After a choice the card collapses to a small pill with a tick/cross and disappears; a toast-style "Gemt" is
  announced to screen readers.
- Footer link "Privatlivsindstillinger" re-opens the same card so the choice can be changed.
- "Læs mere" opens `/privatliv`, a short page in the site's own style (see below).

## Behaviour and rules

- Storage: `localStorage["consent"] = { analytics: boolean, decidedAt: ISO, version: 1 }`.
- No stored choice → banner shown, analytics **off**. "Nej tak" is also stored so the banner does not reappear.
- Re-ask after 12 months or when `version` changes (e.g. a new analytics tool).
- Accept: inject the gtag script and `gtag('config', …)` at that moment (and on later visits at load).
- Withdraw/refuse after previously accepting: stop sending, delete the `_ga*` cookies for the domain, set
  `window['ga-disable-G-ZT1Z6X8C7F'] = true`.
- Remove the unconditional gtag snippet from `src/app.html`.
- Do Not Track / Global Privacy Control: treat `navigator.globalPrivacyControl === true` as "no" without asking
  (open question 3).

## The `/privatliv` page

Short Danish page covering: who is responsible (name, contact), what is collected (page views, approximate
location, device type, via Google Analytics), purpose, legal basis (consent), retention, that data goes to Google
(US transfer), how to withdraw (button on the page), and the right to complain to Datatilsynet.
Include the same consent controls on the page. Indexable but low priority in the sitemap.

## Performance bonus

`/gtag/js` is the single biggest request on the home page: **178 kB, 75 kB of it unused** (Lighthouse, mobile).
Loading it only after consent removes it for everyone who declines and moves it off the critical path for everyone
else.

## Technical notes

- `consent.svelte.ts` rune store (read/write storage, `status: 'unknown' | 'granted' | 'denied'`).
- `ConsentNotice.svelte` mounted in `+layout.svelte`; `analytics.ts` with `loadAnalytics()` / `disableAnalytics()`.
- CSP: the app currently sets only `object-src` and `base-uri`; if a stricter CSP is added later, allow
  `googletagmanager.com` and `google-analytics.com` only after consent.
- Use `position: fixed` with safe-area insets so it never shifts layout; z-index below the header's dropdowns.

## Accessibility

- `role="region" aria-label="Privatliv"`, not a focus-trapping dialog. Focus is not stolen on appear; it is
  reachable as the first element after the header in tab order on first load.
- Buttons are real `<button>`s, 44 px high, contrast at least 4.5:1 in both themes.
- `aria-live="polite"` confirmation after choosing.

## Test plan

- Playwright: fresh context → no request to `googletagmanager.com` and no `_ga` cookie; "Nej tak" → still none;
  "Det er fint" → script requested; reload → remembered; footer link re-opens; withdraw removes cookies.
- axe scan with the banner open (both themes).

## Open questions

1. **Alternative: drop Google Analytics** for a cookie-free tool (Plausible, Umami, Cloudflare Web Analytics).
   Cookie-free tools usually need no consent banner at all, are about 1 kB instead of 178 kB, and simplify the
   privacy page. Do you specifically need GA4, or just "which recipes are read"? **Recommendation:** consider the
   cookie-free route; if you stay with GA, use this spec as written.
2. Who is named as the data controller on `/privatliv` (you personally, "by Bear")? Contact e-mail to show?
3. Auto-honour Global Privacy Control as "no"?
4. Banner position: bottom-left card (recommended) or a slim full-width bar?
