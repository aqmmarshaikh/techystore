# 🍏 TechyMart E-Commerce | Enterprise Next.js Architecture

Welcome to the **TechyMart** documentation. This is a production-ready, single-seller e-commerce marketplace built specifically to handle modern operational scale (up to 5,000+ products and thousands of daily active users). 

It embraces Apple-inspired minimal design, blazing-fast Server Components, and a robust Firebase backend architecture.

---

## 🏗 Tech Stack

**Frontend Framework:** Next.js 15 (App Router), React 19, TypeScript  
**Styling:** Tailwind CSS, shadcn/ui, Lucide Icons  
**State Management:** Zustand (Local state), Firebase Realtime Hooks (Server state)  
**Forms & Validation:** React Hook Form + Zod  
**Backend:** Firebase (Auth, Firestore, Storage)  
**Hosting Target:** Vercel  

---

## 📂 Project Structure (Feature-Based)

We employ a strict feature-based vertical slice architecture to ensure future-proofing and mobile-app API readiness:

```text
src/
├── app/               # Next.js App Router (Pages & Layouts)
│   ├── (admin)/       # Secure Admin Dashboards
│   ├── (auth)/        # Authentication Pages
│   └── (customer)/    # Customer Account & Wishlist
├── components/        # Shared global UI (shadcn/ui, Layout components)
├── features/          # Domain-specific components (e.g., features/products)
├── services/          # Firebase backend interaction layer (Service Classes)
├── store/             # Zustand global state (cartStore, authStore)
├── types/             # Centralized TypeScript definitions
├── hooks/             # Custom React Hooks (e.g., useRateLimit)
└── firebase/          # Firebase initialization and config
```

---

## 🔐 Firebase Database Architecture

Our Firestore NoSQL database is aggressively indexed to minimize read costs while supporting complex filtering.

### Core Collections
1. **`users`**: `{ uid, name, email, role: "customer" | "admin", addresses[], wishlist[] }`
2. **`products`**: `{ id, title, slug, price, salePrice, stock, categoryId, featured, isActive, variants[] }`
3. **`categories`**: `{ id, name, slug, image, isActive }`
4. **`orders`**: `{ id, userId, items[], subtotal, total, paymentMethod: "COD", status, deliverySlot }`
5. **`reviews`**: `{ id, productId, userId, rating, comment }`

### Security Rules Strategy
- **Products/Categories:** Publicly readable. Admin-only writable.
- **Orders/Reviews:** Users can only read/write their *own* documents.
- **Admin Protection:** Strict validation ensuring only `role == "admin"` can mutate catalog and global settings data.

---

## 🚀 Setup & Deployment Guide

### 1. Environment Variables
Create a `.env.local` file in the root of the project. You must retrieve these values from your [Firebase Console](https://console.firebase.google.com/):

```env
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
```

### 2. Local Development
```bash
npm install
npm run dev
```

### 3. Vercel Deployment
1. Push this repository to GitHub.
2. Go to Vercel and **Import** the repository.
3. In the environment variables step, paste all 6 `NEXT_PUBLIC_FIREBASE_*` keys.
4. Click **Deploy**. Vercel will automatically detect Next.js and build the application.

---

## 🛡 Enterprise Features Implemented

- **PWA (Progressive Web App):** Installable natively via `manifest.ts` and standard icon caching.
- **Global Error Boundaries:** Custom `global-error.tsx` catches React crashes and provides a graceful fallback UI.
- **Audit Logging:** An Admin Activity tracker records system modifications.
- **Product Variants:** Products natively support Size/Color arrays with explicit price adjustments.
- **Rate Limiting:** Frontend hook safeguarding forms against brute force or spam clicking.

## 📱 Future Expansion Blueprint
The `src/services/` layer was specifically designed to be decoupled from Next.js. If you decide to build a **React Native** mobile application in the future, you can copy the entire `services/` and `store/` folders directly into the mobile codebase, achieving instant parity with the web backend!
