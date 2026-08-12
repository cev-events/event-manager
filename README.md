# CEV EVENTS — Multi-Community Event Management Platform

A modern, high-performance event management, slot booking, and public discovery platform built for **College of Engineering Vadakara (CE Vadakara)** campus communities (IEEE SB CEV, IEDC CEV, TinkerHub CEV, FOSS Club CEV, MuLearn CEV).

---

## 🚀 Key Features & Capabilities

- **Nixtio Swiss Editorial UI & Dynamic Scroll Hero:** Features an edge-to-edge dark hero section with smooth cubic-bezier scroll shrink animation (`w-[99%]` to `w-[95%]`, `min-h-[99vh]` to `min-h-[75vh]`, `rounded-[1.3rem]` to `rounded-[1rem]`), oversized display headline (`CEV EVENTS`), 6-column community logo card grid (`001 / Our Communities`), and 3-column schedule timeline cards (`min-h-[680px]`) with dark poster overlays and 300ms rotating arrow CTAs.
- **3-State Floating Navbar & Standalone Logo:** Dynamic scroll detection switching between standalone white logo (`/cev_logo.svg`) over dark hero and black logo (`/cev_logo_b.svg`) over light pages, featuring spaced-out initial links, compact white glass floating pill (`bg-white/70 backdrop-blur-2xl`), and context-aware CTA buttons.
- **Global Page Entrance Animations:** Integrated Framer Motion page entrance transitions (`initial={{ opacity: 0, y: 24, filter: 'blur(5px)' }}`) delivering smooth fluid navigation across all public routes.
- **Interactive Google Calendar Slot Booking Engine:** Features Month, Week, Day, and Grid views where organizers click date/time slots to reserve dates in `closed` draft mode before publishing to `live` state.
- **College Event & Academic Schedule Booking:** Exclusive slot booking option for Superusers (`dev`) and Admins (`admin`) to book official college-conducted events, exams, and academic schedules with dedicated Ocean Royal Blue (`#0ea5e9`) visual styling, while restricting non-admin access.
- **Connected Multi-Day Calendar Banners:** Multi-day events span continuously across calendar columns as single horizontal line bars with zero-gap column boundary alignment (`px-0` day cell containers).
- **Custom Community Brand Color Signatures:** Custom color picker (10 preset swatches, HTML color picker `<input type="color">`, hex input) for communities. Events automatically render using their community signature color for background fill, border accent, and bullet dots.
- **W3C Relative Luminance Text Contrast:** Perceived relative luminance algorithm `(0.299*R + 0.587*G + 0.114*B) / 255`. If a community color is dark (< 0.6), community name text automatically renders in crisp bright white (`#f8fafc`) for 100% readability.
- **Dev / Superuser RBAC Account Protection:** Strict role isolation protecting `dev` accounts. Non-dev roles cannot view, edit, elevate to, or delete `dev` accounts in UI or backend API routes (returning `403 Forbidden`).
- **Standalone Viewport-Sticky Admin Sidebar & Glassmorphism Mobile Bottom Navbar:** Extracted navigation sidebar with `sticky top-0 h-screen` desktop layout and a floating glassmorphic bottom navigation bar (`backdrop-blur-2xl bg-[#0f121d]/75`) with glowing active tab indicators for mobile touch screens (`< md`).
- **Closed Slot View Page Privacy Guard:** Public view page links (`/events/[id]`) are strictly suppressed for draft (`closed`) slots to protect unpublished reservations from being previewed until officially released to `live` status.
- **Vercel Blob Storage Integration:** Direct client-side WebP image conversion and asset uploading for event posters (`posters/*.webp`), community logos (`logos/*.webp`), and user avatars (`avatars/*.webp`).
- **Fast AI Event Assistant:** Multi-provider fallback AI chat engine (`gemini-1.5-flash` with Grok & OpenRouter fallbacks) delivering direct answers for event schedules, venues, rules, and registration guidance.
- **Custom Font Optimization (`next/font/local`):** Zero Cumulative Layout Shift (CLS) font engine featuring `Quera` (Display Headlines), `Gued` (Section Headings), and `Rondured` (Body Copy).
- **Clean Production Codebase:** Zero temporary comments or inline block notes across all `.ts`, `.tsx`, `.js`, and `.css` source code files.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Runtime** | Node.js with React 19 & TypeScript 5 |
| **Styling** | Tailwind CSS v4 + Obsidian Dark Design Tokens |
| **Smooth Scroll** | Lenis Smooth Scroll ([app/components/SmoothScroll.tsx](./app/components/SmoothScroll.tsx)) |
| **Database & Auth** | Supabase PostgreSQL + Supabase Auth (OTP & Password) |
| **Storage Engine** | Vercel Blob Storage (`@vercel/blob`) via `./app/api/upload/route.ts` |
| **AI Integration** | Google Generative AI (`@google/generative-ai`) + Grok & OpenRouter |
| **Fonts** | Local font binaries ([fonts/](./fonts/)) |

---

## 🔑 Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Vercel Blob Storage Key
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token_here

# AI Assistant API Keys
GEMINI_API_KEY=your_gemini_api_key
GROK_API_KEY=your_grok_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

---

## 💻 Developer Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript compilation check
npx tsc --noEmit

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 📁 Repository Structure

```
event-manager/
├── .agents/
│   └── AGENTS.md                  # Developer agent workspace rules & guidelines
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── my-community/route.ts # Manager level community update API
│   │   │   └── users/route.ts     # Admin users management API with Dev role guards
│   │   ├── chat/route.ts          # Fast AI assistant endpoint (gemini-1.5-flash)
│   │   ├── profile/route.ts       # Self profile update API
│   │   └── upload/route.ts        # Vercel Blob storage upload route
│   ├── admin/                     # Protected Admin Console (/admin, /events, /communities, /users, /my-community)
│   ├── calendar/                  # Google Calendar view route (Month, Week, Day grids)
│   ├── components/                # Reusable UI components (AdminSidebar, GoogleCalendarView, MasterCalendar)
│   ├── events/                    # Public event directory & dynamic detail pages
│   └── layout.tsx                 # Root layout with font optimization
├── fonts/                         # Custom font binaries (.otf, .ttf)
├── lib/                           # Core utilities, Supabase client, WebP converter, & summarizers
├── public/
│   └── fonts/                     # Public font binaries for fallback web loading
├── changelogs.md                  # Detailed versioning history
├── CONTRIBUTORS.md                # Creator attribution & live GitHub contributor roll
├── design.md                      # Design system tokens & typography spec
├── LICENSE                        # MIT License for Shibili Aman TK
├── project_memory.md              # Technical program memory & database schema
├── README.md                      # Project documentation (this file)
└── SECURITY.md                    # Security policy & vulnerability reporting
```
