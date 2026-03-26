You are helping me build a rider app called "Sosika Rider" — a PWA (Progressive Web App) for food delivery riders, similar to the Bolt Food or Uber Eats driver app. It will be converted to a TWA (Trusted Web Activity) and published on the Google Play Store.

## Project context

The project has already been scaffolded with:
- Vite + React + TypeScript
- Tailwind CSS
- The project root is the current directory

There is an existing customer-facing Sosika app (separate codebase) that:
- Takes food orders from customers
- Saves orders to Firebase Firestore with this exact data shape:
```ts
{
  orderId: string,           // Firestore document ID
  userId: string,            // 'guest' or Firebase Auth UID
  phone: string,
  cart: Array<{
    name: string,
    price: string,
    quantity: number
  }>,
  subtotal: number,
  deliveryFee: number,
  totalAmount: number,
  displayLocation: string,   // human-readable address
  locationCoords: string,    // "lat,lng" string
  rawCoordinates: string,    // JSON string of location object
  timestamp: Timestamp,
  status: OrderStatus,       // see type below
  riderId: string | null,
  assignedAt: Timestamp | null,
  pickedUpAt: Timestamp | null,
  deliveredAt: Timestamp | null,
  paymentStatus: 'unpaid' | 'paid',
}
```

The order status type is:
```ts
type OrderStatus =
  | 'pending'      // customer placed order, waiting for admin
  | 'confirmed'    // admin confirmed, now visible to riders
  | 'assigned'     // a rider accepted it
  | 'in_transit'   // rider picked up from restaurant
  | 'completed'    // delivered and paid
  | 'cancelled'
```

The rider app reads and writes to the SAME Firebase project and SAME Firestore `orders` collection as the customer app. It does not have its own backend.

## Firebase services in use (existing project)

- **Firestore** — orders collection (shared with customer app)
- **Firebase Auth** — phone number OTP authentication for riders
- **Firebase Realtime Database** — live GPS location broadcasting (riders write here, customer app reads to show rider on map)
- **FCM (Firebase Cloud Messaging)** — push notifications to riders when a new order is confirmed and available
- **Firebase Storage** — rider KYC documents and profile photos

## What the rider app must do

### Authentication
- Phone number OTP login using Firebase Auth
- On first login, rider completes a profile: name, vehicle type (motorcycle/bicycle/car), license plate, profile photo
- Profile saved to Firestore `riders/{uid}` collection
- Rider must be approved (riders/{uid}.approved == true) before they can go online

### Home screen (online/offline toggle)
- Rider can toggle themselves online or offline
- When online, rider's status is written to Realtime Database: `riders/{uid}/status: 'online'`
- When online, app starts a Firestore `onSnapshot` listener on `orders` collection filtered by `status == 'confirmed'`
- Map (Google Maps) shows rider's current position
- Incoming order cards appear when confirmed orders are available

### Incoming order flow
- When a `confirmed` order appears, show a bottom sheet card with: customer location on map, distance estimate, order items summary, total amount, delivery fee
- Rider has 30 seconds to accept or decline
- If accepted: write `status: 'assigned'`, `riderId: uid`, `assignedAt: serverTimestamp()` to the order document
- If declined or timed out: order goes back to available pool (rider app just stops showing it, another rider can accept)
- Only ONE rider can accept — use a Firestore transaction to prevent race conditions

### Active delivery screen
- Shows after rider accepts an order
- Google Maps navigation from rider's location to restaurant (pickup), then to customer (delivery)
- Two-stage flow: PICKUP (rider heading to restaurant) → DELIVERY (rider heading to customer)
- "Picked up" button writes `status: 'in_transit'`, `pickedUpAt: serverTimestamp()`
- "Delivered" button writes `status: 'completed'`, `deliveredAt: serverTimestamp()`, `paymentStatus: 'paid'`
- GPS position is broadcast to Realtime Database every 5 seconds while active: `riders/{uid}/location: { lat, lng, heading, timestamp }`
- Stop broadcasting when delivery is completed

### Earnings screen
- List of completed deliveries for the current rider
- Daily and weekly earnings totals
- Each delivery shows: order ID, amount earned, timestamp, customer location

### Profile screen
- Rider's name, photo, vehicle info
- Toggle notifications on/off
- Logout button

## Tech stack decisions (already decided, do not change)

- **Framework**: Vite + React + TypeScript (already scaffolded)
- **Styling**: Tailwind CSS (already installed)
- **State management**: Zustand — for order state machine and rider online/offline status
- **Data fetching**: TanStack Query (React Query) — for Firestore reads
- **Routing**: React Router v6
- **Maps**: @vis.gl/react-google-maps
- **PWA**: vite-plugin-pwa (Workbox)
- **Firebase**: firebase v10+ (modular SDK)

## PWA requirements

- App must be installable (manifest.json with correct icons, theme color, display: standalone)
- Service worker must cache the app shell for offline resilience
- `firebase-messaging-sw.js` must be in `/public` for FCM background notifications
- App must pass Lighthouse PWA audit (score ≥ 90) to qualify for TWA conversion

## Project structure to create
sosika-rider/
├── public/
│   ├── manifest.json
│   ├── firebase-messaging-sw.js
│   └── icons/                      (PWA icons, I will add these)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── firebase.ts                  (Firebase singleton init)
│   ├── types/
│   │   └── order.ts                 (OrderStatus type + Order interface)
│   ├── store/
│   │   ├── riderStore.ts            (Zustand: online status, active order)
│   │   └── orderStore.ts            (Zustand: available orders list)
│   ├── hooks/
│   │   ├── useOrders.ts             (TanStack Query + onSnapshot for available orders)
│   │   ├── useActiveOrder.ts        (onSnapshot for the rider's current assigned order)
│   │   ├── useGeoLocation.ts        (watchPosition + throttled RTDB write)
│   │   └── useFCMToken.ts           (register FCM token, save to riders/{uid})
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Home.tsx
│   │   ├── ActiveDelivery.tsx
│   │   ├── Earnings.tsx
│   │   └── Profile.tsx
│   ├── components/
│   │   ├── OrderCard.tsx            (incoming order bottom sheet)
│   │   ├── MapView.tsx              (Google Maps wrapper)
│   │   ├── OnlineToggle.tsx
│   │   ├── DeliverySteps.tsx        (pickup → delivery progress)
│   │   └── ProtectedRoute.tsx
│   └── lib/
│       ├── firestore.ts             (order read/write helpers)
│       └── rtdb.ts                  (location broadcasting helpers)

## Environment variables needed

Create a `.env.example` file with:
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_URL=
VITE_GOOGLE_MAPS_API_KEY=

## Task

Set up the complete project foundation:

1. Install all required dependencies:
   - react-router-dom
   - zustand
   - @tanstack/react-query
   - firebase
   - @vis.gl/react-google-maps
   - vite-plugin-pwa

2. Create every file in the project structure above with production-quality, fully implemented code. Do not use placeholder comments like "// TODO" or "// implement later". Write real working logic in every file.

3. For `firebase.ts`: initialize the Firebase app using the env vars. Export `db`, `auth`, `rtdb`, `storage`, and `messaging` instances. Use the modular v10 SDK (`firebase/firestore`, `firebase/auth`, etc.).

4. For `types/order.ts`: write the full `Order` interface and `OrderStatus` type matching the Firestore data shape above. Also write a `Rider` interface for `riders/{uid}`.

5. For `store/riderStore.ts`: Zustand store with: `isOnline`, `currentRider`, `activeOrderId`, and actions `setOnline`, `setOffline`, `setActiveOrder`, `clearActiveOrder`.

6. For `store/orderStore.ts`: Zustand store with: `availableOrders: Order[]`, `setAvailableOrders`.

7. For `hooks/useGeoLocation.ts`: use `navigator.geolocation.watchPosition`, throttle writes to RTDB to every 5 seconds, stop watching when rider goes offline. Export the current `{ lat, lng }` position.

8. For `lib/firestore.ts`: write these functions:
   - `acceptOrder(orderId, riderId)` — Firestore transaction that checks status is still 'confirmed' before writing 'assigned'
   - `markPickedUp(orderId)`
   - `markDelivered(orderId)`
   - `getRiderEarnings(riderId)` — query completed orders for this rider

9. For `lib/rtdb.ts`: write `broadcastLocation(riderId, lat, lng)` and `setRiderOnlineStatus(riderId, status)`.

10. For `public/manifest.json`: complete PWA manifest for Sosika Rider. Use brand color `#FF6B35` (Sosika orange) as theme color. `display: standalone`, `orientation: portrait`.

11. For `public/firebase-messaging-sw.js`: complete service worker that handles FCM background messages and shows a notification with the order details.

12. For `vite.config.ts`: configure vite-plugin-pwa with Workbox. Use `GenerateSW` strategy. Cache the app shell with `networkFirst` for Firebase API calls and `cacheFirst` for static assets.

13. For `App.tsx`: set up React Router with all routes. Wrap with `QueryClientProvider`. Add a route guard — redirect to `/login` if not authenticated, redirect to `/onboarding` if authenticated but profile incomplete, redirect to `/home` otherwise.

14. For `pages/Login.tsx`: implement Firebase phone auth with OTP. Use `RecaptchaVerifier` and `signInWithPhoneNumber`. After successful auth, check if rider profile exists in Firestore. If not, redirect to onboarding.

15. For `components/OrderCard.tsx`: a bottom sheet that shows incoming order details (items, distance, earnings). Has a 30-second countdown timer. Accept and Decline buttons. On accept, calls `acceptOrder()` transaction from `lib/firestore.ts`.

16. For `pages/ActiveDelivery.tsx`: full delivery screen. Shows the Google Map. Has a state machine: PICKUP phase (navigate to restaurant, show "Picked Up" button) and DELIVERY phase (navigate to customer, show "Delivered" button). GPS broadcasting runs during this entire screen.

After generating all files, provide a summary of:
- Which npm install commands to run
- Any Firebase console setup steps needed (Realtime Database rules, Firestore indexes, enabling phone auth)
- The Bubblewrap CLI commands to convert the PWA to a TWA after the app is built