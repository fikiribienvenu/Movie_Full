<<<<<<< HEAD
#  IWACUFLIX — Premium Movie Streaming Platform

A modern, production-ready movie streaming & selling frontend built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

---

## Features

- **Authentication** — Login & Signup with full form validation (Zod + React Hook Form)
- **Home Page** — Cinematic hero banner, movie categories, category filtering
- **Movie Detail Page** — Full details, trailer/video player, lock screen for non-subscribers
- **Subscription System** — 3-tier pricing (Basic, Premium, Annual) with mock payment UI
- **User Dashboard** — Profile, stats, watchlist, subscription management
- **Search & Browse** — Live search, category filters, sort by rating/year/title
- **State Management** — Zustand with localStorage persistence
- **Responsive Design** — Mobile-first, works on all screen sizes
- **Dark Theme** — Premium dark aesthetic throughout
- **Framer Motion** — Smooth page transitions and micro-animations
- **Protected Routes** — Subscription-gated content

---

##  Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the project
cd IWACUFLIX

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  Project Structure

```
src/
├── app/                        # Next.js 14 App Router
│   ├── page.tsx                # Home page
│   ├── layout.tsx              # Root layout with fonts
│   ├── globals.css             # Global styles
│   ├── loading.tsx             # Loading skeleton
│   ├── not-found.tsx           # 404 page
│   ├── auth/
│   │   ├── login/page.tsx      # Login page
│   │   └── signup/page.tsx     # Signup page
│   ├── movies/
│   │   └── [id]/page.tsx       # Movie detail page
│   ├── dashboard/page.tsx      # User dashboard
│   ├── pricing/page.tsx        # Pricing/plans page
│   └── search/page.tsx         # Search & browse page
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Sticky navbar with auth state
│   │   └── Footer.tsx          # Site footer
│   ├── movies/
│   │   ├── MovieCard.tsx       # Movie card with hover effects
│   │   ├── MovieGrid.tsx       # Responsive movie grid
│   │   ├── MovieSkeleton.tsx   # Loading skeleton
│   │   ├── HeroSection.tsx     # Featured movie hero
│   │   └── CategoryFilter.tsx  # Animated category pills
│   ├── ui/
│   │   ├── PricingCard.tsx     # Subscription plan card
│   │   ├── Toast.tsx           # Toast notifications
│   │   └── ProtectedRoute.tsx  # Auth/subscription guard
│   └── auth/
│
├── lib/
│   ├── data.ts                 # Mock movie data & helper functions
│   └── utils.ts                # Utility functions (cn, formatRating, etc.)
│
├── store/
│   └── authStore.ts            # Zustand store (auth + subscription)
│
├── hooks/
│   └── useAuth.ts              # Auth hook wrapper
│
└── types/
    └── index.ts                # TypeScript type definitions
=======
#  IWACUFLIX — Full Stack Movie Streaming Platform

A complete, production-ready movie streaming platform with a **Next.js 14 frontend** and **Node.js/Express backend**, connected to **MongoDB**.

---

##  Project Structure

```
IWACUFLIX-fullstack/
├── frontend/                    # Next.js 14 App (TypeScript + Tailwind)
│   ├── src/
│   │   ├── app/                 # App Router pages (9 pages)
│   │   ├── components/          # 11 reusable components
│   │   ├── store/               # Zustand global state
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Data helpers & utilities
│   │   └── types/               # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.mjs
│
├── backend/                     # Node.js + Express REST API
│   ├── src/
│   │   ├── server.js            # Entry point
│   │   ├── app.js               # Express app
│   │   ├── config/              # DB connection
│   │   ├── models/              # 4 Mongoose schemas
│   │   ├── controllers/         # 6 route controllers
│   │   ├── routes/              # 6 Express routers
│   │   ├── middleware/          # Auth, validation, upload, errors
│   │   └── utils/               # JWT, email, logger, seeder
│   ├── package.json
│   └── .env.example
│
├── package.json                 # Root scripts
└── .gitignore
```

---

##  Quick Start

### 1. Install all dependencies
```bash
cd IWACUFLIX-fullstack
npm run install:all
```

### 2. Configure backend environment
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/IWACUFLIX
JWT_SECRET=your-secret-key-min-32-characters-long
CLIENT_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### 3. Configure frontend environment
```bash
# Create frontend/.env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1" > frontend/.env.local
```

### 4. Seed the database
```bash
npm run seed
```

### 5. Start both servers

**Terminal 1 — Backend:**
```bash
npm run dev:backend
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
npm run dev:frontend
# Runs on http://localhost:3000
>>>>>>> f6d02f0 (setting signup)
```

---

<<<<<<< HEAD
##  Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `brand-red` | `#e50914` | Primary CTA, highlights |
| `brand-gold` | `#f5c518` | Premium, ratings, accents |
| `bg-primary` | `#0a0a0f` | Main background |
| `bg-secondary` | `#111118` | Cards, surfaces |
| `text-primary` | `#ffffff` | Main text |
| `text-secondary` | `#b3b3cc` | Subtext |

### Fonts
- **Display**: Bebas Neue — used for titles, section headers
- **Body**: DM Sans — used for all body text, UI elements

---

##  Authentication Flow

1. User visits **Sign Up** → fills form (name, email, password, confirm) → redirected to Pricing
2. User chooses a **Plan** → mock payment → redirected to Dashboard
3. **Subscribed users** get full movie access
4. **Non-subscribed users** see trailer + lock screen on movie detail
5. State persists in localStorage via Zustand `persist` middleware

---

##  Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` 14 | App Router, SSR, routing |
| `framer-motion` | Page transitions, animations |
| `zustand` | Global state management |
| `react-hook-form` | Form state management |
| `zod` | Schema validation |
| `@hookform/resolvers` | Zod adapter for RHF |
| `lucide-react` | Icon library |
| `tailwind-merge` | Conditional class merging |
| `clsx` | Class name utility |

---

## 🛠 Customization

### Add New Movies
Edit `src/lib/data.ts` and add a new object to the `movies` array:

```ts
{
  id: 13,
  title: "My Movie",
  description: "Description...",
  poster: "https://...",
  backdropUrl: "https://...",
  trailerUrl: "https://www.youtube.com/embed/...",
  videoUrl: "/videos/my-movie.mp4",
  category: "Action",
  rating: 8.5,
  year: 2024,
  duration: "2h 10m",
  genre: "Action · Thriller",
  director: "Director Name",
  cast: ["Actor 1", "Actor 2"],
  trending: true,
  badge: "new",
}
```

### Add Real Video
Replace `videoUrl` with actual video URLs or integrate a service like Mux or Cloudflare Stream.

### Connect Real Auth
Replace the `authStore.ts` login/signup actions with real API calls to your backend.

---

##  Notes

- This is a **demo frontend** — no real payments are processed
- Movie images use Unsplash; replace with TMDB or your own CDN
- Video player is mocked; integrate Mux or Cloudflare Stream for production
- Auth is local state; connect to a backend (e.g., NextAuth.js) for production
=======
## 🔐 Default Credentials (after seeding)

| Role  | Email                  | Password     |
|-------|------------------------|--------------|
| Admin | admin11@IWACUFLIX.com      | Admin@1234   |
| User  | alex@22example.com       | Alex@1234    |

---

## 📡 API Base URL

```
http://localhost:5000/api/v1
```

### Key Endpoints

| Endpoint                          | Description                    |
|-----------------------------------|--------------------------------|
| `POST /auth/signup`               | Register new account           |
| `POST /auth/login`                | Login → JWT token + cookie     |
| `GET  /movies`                    | List movies (filter, sort, paginate) |
| `GET  /movies/featured`           | Get featured movie             |
| `GET  /movies/trending`           | Get trending movies            |
| `GET  /movies/search?q=batman`    | Full-text search               |
| `GET  /movies/:id/stream`         | Stream URL (subscribers only)  |
| `POST /subscriptions`             | Subscribe to a plan            |
| `GET  /subscriptions/plans`       | Get all plan details           |
| `GET  /users/me/watchlist`        | Get my watchlist               |
| `GET  /admin/dashboard`           | Admin stats (admin only)       |

---

##  Frontend Features

- Dark premium cinema theme (Bebas Neue + DM Sans)
- Cinematic hero banner with featured movie
- Movie grid with hover overlays, trailer & subscribe CTAs
- Category filter bar with animated active pill
- Full movie detail page — trailer vs full video (gated by subscription)
- Login & signup with Zod validation
- 3-tier pricing page (Basic, Premium, Annual)
- User dashboard — profile, stats, watchlist, billing
- Live search with debounce + category filters
- Zustand state persisted in localStorage
- Protected routes (auth + subscription guards)
- Loading skeletons, Framer Motion animations

---

##  Backend Features

- JWT auth (Bearer + httpOnly cookie)
- bcryptjs password hashing (12 rounds)
- Helmet, CORS, rate limiting (100/15min global, 10/15min auth)
- MongoDB text search across title, description, tags
- Subscription system (mock Stripe, real structure)
- Email: welcome, password reset, subscription confirm (Nodemailer)
- Multer file uploads (avatar, movie images, video)
- Winston logging (console dev, file prod)
- Soft delete for users and movies
- Admin dashboard with revenue stats and aggregations
- Paginated, filterable, sortable movie API

---

##  Frontend ↔ Backend Integration

To switch the frontend from mock data to the real API, update `src/store/authStore.ts`:

```ts
// Replace mock login with:
login: async (email, password) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.success) set({ isLoggedIn: true, user: data.data.user });
}
```

And update movie pages to fetch from `/api/v1/movies` instead of `src/lib/data.ts`.

---

##  Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
# Set: NEXT_PUBLIC_API_URL=https://your-api.railway.app/api/v1
```

### Backend → Railway / Render
1. Connect GitHub repo
2. Set root directory to `backend/`
3. Set environment variables (MONGO_URI, JWT_SECRET, etc.)
4. Deploy
>>>>>>> f6d02f0 (setting signup)

---

##  License

<<<<<<< HEAD
MIT — use freely for personal and commercial projects.
=======
MIT — free for personal and commercial use.
>>>>>>> f6d02f0 (setting signup)


To link IWACUFLIX.com to your Vercel deployment, follow these steps:

Step 1 — Add domain in Vercel

Go to vercel.com → open your Movie_Full project
Click Settings → Domains
Click Add Domain
Type IWACUFLIX.com → click Add
Also add www.IWACUFLIX.com → click Add
Vercel will show you DNS records to add — keep this page open


Step 2 — Update DNS in Hostinger

Go to hpanel.hostinger.com
Click Domains → click IWACUFLIX.com
Click DNS / Nameservers → DNS Records
You need to add/update these records:

TypeNameValueA@76.76.21.21CNAMEwwwcname.vercel-dns.com

Delete any existing A or CNAME records that conflict
Save changes


Step 3 — Wait for propagation
DNS changes take 5 minutes to 48 hours to propagate. Usually it's done within 30 minutes.
You can check progress at dnschecker.org — type IWACUFLIX.com and watch for the green checkmarks.

Step 4 — Verify in Vercel
Once DNS propagates, go back to Vercel → Settings → Domains. You'll see a green Valid Configuration checkmark next to IWACUFLIX.com. Vercel also automatically issues a free SSL certificate so your site will be https://IWACUFLIX.com.

Step 5 — Update your environment variables
After the domain is live, update your Railway backend environment variable:
CLIENT_URL=https://iwacuflix.com
This ensures AfriPay redirects back to IWACUFLIX.com instead of movie-full-eta.vercel.app after payment. Redeploy Railway after changing it.
