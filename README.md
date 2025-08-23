# Haynes Eggspress — Starter (with Address Autocomplete)

Local weekly organic egg delivery (initially ZIP 33584).
- QR landing → coverage gate → plan & weekday → Stripe Checkout (weekly $7/dozen)
- Address autocomplete (Google Places) → precise lat/lng capture
- Polygon geofence (optional via GeoJSON) with ZIP fallback
- Outside-area lead capture (email + full address + lat/lng + placeId)
- Admin/driver: tomorrow’s stops & mark delivered
- Daily order generation cron (Mon–Fri)

## Quickstart

```bash
npm i
cp .env.example .env.local   # fill keys
npx prisma migrate dev --name init
npm run dev
```

## Deploy (Vercel)
- Add environment variables from `.env.example`
- Add Cron Jobs (Project Settings → Cron Jobs):
  - `/api/orders/generate` daily at 9:00 AM
  - `/api/reminders/run`  daily at 9:05 AM
- Stripe Webhook endpoint:
  - URL: `/api/stripe-webhook`
  - Events: `customer.subscription.created`, `customer.subscription.updated`

## Stripe Setup
Create **one** Product:
- Name: `Eggs — weekly (per dozen)`
- Price: `$7`, Recurring **weekly**, **Adjustable quantity: ON**
Copy its **Price ID** to `.env.local` as `STRIPE_PRICE_PER_DOZEN`.

## Address Autocomplete + Coverage
- Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local` (enable Places + Maps JavaScript APIs)
- (Optional) Paste a **GeoJSON** polygon into `SERVICE_AREA_GEOJSON` for precise geofencing.
  - If empty, the app falls back to `NEXT_PUBLIC_SERVICE_ZIP=33584`.

## Data for outside-area leads
- Stores: email, postal (ZIP), fullAddress, placeId, lat, lng (in `Interest` table).
