# Packify

A clean, single-seller resource-pack storefront for Minecraft 1.8.9 PvP packs.
Pure HTML/CSS/vanilla JS — no build step, no dependencies.

## Run locally

```bash
cd Packs
python3 -m http.server 8000
# open http://localhost:8000
```

Any static file server works.

## Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Hero, featured packs, benefits |
| Explore | `explore.html` | Search, sort, full pack grid |
| Pack detail | `pack.html?id=<pack-id>` | Pack info + purchase form |
| Receipt | `receipt.html?id=<order-id>` | Order created, copy receipt, Discord CTA |
| Order lookup | `order.html` | Check order status (`?id=` deep link supported) |
| About | `about.html` | Store info + how purchasing works |

## Structure

```
css/style.css   — all styles (dark theme, orange accent)
js/data.js      — pack catalog (PACKS array)
js/orders.js    — order system (localStorage)
js/ui.js        — shared header/footer, pack cards, helpers
```

## Configuration

- **Discord invite**: set `DISCORD_URL` in `js/ui.js` (currently `'#'`).
- **Packs**: edit the `PACKS` array in `js/data.js`.

## Purchase flow

1. Customer clicks **Get This Pack** on a pack page.
2. `createOrder()` in `js/orders.js` generates a unique `PK-XXXXXX` order ID,
   stores the order in `localStorage`, and builds receipt text.
3. Customer lands on the receipt page: copy receipt, join Discord, open a ticket.
4. Seller verifies manually in Discord and sends the download.

Order statuses: `Pending → Verified → Completed` (update via `updateOrderStatus()`;
for a real store, do this from an admin panel backed by a database).

## Adding payments later (Stripe / Razorpay)

The purchase flow is intentionally decoupled from payment:

1. On the pack page, instead of calling `createOrder()` immediately, redirect to
   your payment provider's checkout with the pack ID + price.
2. On the provider's success webhook/callback, call `createOrder(packId, customer)`
   (or a new `confirmOrder()` that flips status to `Verified`).
3. Everything downstream — receipt, Discord ticket, order lookup — stays unchanged.

For production, replace `localStorage` in `js/orders.js` with a backend API
(e.g. Supabase, Firebase, or your own server) so orders persist across devices
and the seller can update statuses.
