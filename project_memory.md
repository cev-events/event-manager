# Technical Program Memory: Multi-Community Event Management Platform

## 1. Executive Summary & Repository Overview
This repository contains **CEV EVENTS**, a high-performance multi-community event management, publishing, slot booking, and discovery platform tailored for campus organizations and technical communities at **College of Engineering Vadakara (CE Vadakara)** (IEEE SB CEV, IEDC CEV, TinkerHub CEV, FOSS Club CEV, MuLearn CEV).

The platform centralizes scheduling, slot reservation, public discovery, direct binary image asset WebP uploads (via `@vercel/blob` & `./app/api/upload/route.ts`), connected multi-day Google Calendar slot booking, custom community brand color signatures with W3C luminance text contrast, strict Dev (Superuser) RBAC protections, and real-time contextual event support via an intelligent **Event Assistant** powered by a multi-provider fallback architecture (`gemini-1.5-flash` with Grok & OpenRouter fallbacks).

---

## 2. Core Architecture & Technology Stack

### Framework & Runtime
* **Framework:** Next.js 16 (App Router) with `remotePatterns` configured in `./next.config.ts` for Vercel Blob Storage.
* **Runtime:** Node.js with React 19 & TypeScript 5.
* **Proxy Middleware:** `./proxy.ts` (Next.js 16 proxy convention) updating Supabase cookies and enforcing role permissions for `/admin` paths.
* **Styling:** Tailwind CSS v4 with Dark Design System combining Restrained Glassmorphism & Light Brutalism.
* **Typography:** `next/font/local` font optimization (`Quera`, `Gued`, `Rondured`) — zero Cumulative Layout Shift (CLS) & preloaded fonts.
* **Smooth Scrolling:** Lenis Smooth Scroll (`./app/components/SmoothScroll.tsx`) with `data-lenis-prevent` on overlay containers.
* **Clean Code Policy:** Zero explanatory inline comments in source code files (`.ts`, `.tsx`, `.js`, `.css`) for maximum production readability.

### Backend, Database & Vercel Blob Storage
* **Database Engine:** Supabase PostgreSQL with RLS (`events`, `communities.color`, `communities.logo_url`, `profiles.avatar_url`).
* **Storage Provider:** Vercel Blob Storage (`@vercel/blob`).
* **Realtime Events Hook & Master Calendar:** `./lib/hooks/useRealtimeEvents.ts` queries `events` joined with `community:communities(id, name, slug, color)` and maps `community_color` onto `EventItemData`.
* **Google Calendar Booking Engine:** `./app/components/GoogleCalendarView.tsx` supports Month, Week, Day, and Grid view modes. Features:
  - **Connected Multi-Day & Single-Day Banners:** `getEventDatePosition(evt, dateObj)` detects multi-day range boundaries, rendering connected horizontal banner bars across calendar columns (`ml-1 mr-0 rounded-l-md` start days, `mx-0 rounded-none` middle days, `mr-1 ml-0 rounded-r-md border-r` ending days with explicit `END` badges, and `mx-1 rounded-md border` single-day cards) while preserving full title, community, time, and status badge legibility.
  - **Dynamic Community Colors:** Dynamically applies community signature colors for event card backgrounds (~20-25% opacity fill), borders (~65-75% opacity), and title bullet dots.
  - **W3C Relative Luminance Contrast:** `isDarkColor(hex)` and `getReadableTextColor(hex)` calculate perceived relative luminance `(0.299*R + 0.587*G + 0.114*B) / 255`. If a community color is dark (< 0.6), community name text automatically renders in crisp bright white (`#f8fafc`) for 100% legibility.
  - **Day View Flex Alignment:** Replaced `grid-cols-2` 50/50 split with a flex container (`w-16 shrink-0` time column + `flex-1` full-width day timeline column). Aligned date header (`Mon 17`) directly above the day timeline, eliminating empty black gaps. In Day Mode, admins can view all events on that timeline and click "+ Book Slot" in the toolbar or click any time slot row to open slot booking.
  - **Event Click Propagation & View Mode Preservation:** All event buttons and cards in `./app/components/GoogleCalendarView.tsx` execute `e.stopPropagation()`. When a user clicks an event or closes an event details popup, the calendar strictly preserves the active view mode (Month stays in Month view, Week stays in Week view, Day stays in Day view, Grid stays in Grid view) without unintentionally triggering month cell background click handlers that navigate to Day mode.
* **Dedicated "My Events" Community Management Portal:** `./app/admin/my-community/events/page.tsx` provides a dedicated events workspace strictly restricted to assigned community managers and editors (`roleRequired: ['manager', 'editor']`). Features community branding header, metric stats (Total, Live, Drafts, Online), responsive **Grid View** cards layout, and interactive **List View** table with search, status filters, format badges (Offline/Online), and slot booking modal pre-populated for that community. Linked from `./app/components/AdminSidebar.tsx`.
* **Manager Community Isolation & Strict RBAC Boundaries:** In `./app/admin/users/page.tsx` and `./app/api/admin/users/route.ts`, Managers (`role === 'manager'`) are strictly scoped to managing team members belonging to their own assigned community (`community_id === currentUserCommunityId`). GET, POST, PUT, and DELETE handlers validate requester role and return `403 Forbidden` if a manager attempts to view, create, edit, or delete accounts outside their community.
* **Screen-Optimized Portal Modals & 2-Column Mobile Grids:** All admin modal popups (`./app/admin/communities/page.tsx`, `./app/admin/users/page.tsx`, `./app/admin/events/page.tsx`, `./app/admin/my-community/events/page.tsx`) utilize React `createPortal(..., document.body)` with `data-lenis-prevent`, high z-index (`z-[99999]`), sticky headers, max-height scrolling (`max-h-[90vh] overflow-y-auto`), and compact 2-column mobile input grids (`grid grid-cols-1 sm:grid-cols-2 gap-3`). This ensures users on mobile screens can instantly view and fill all input fields without long vertical scrolling.
* **Split-Card My Community & Profile Layouts:** Both `./app/admin/profile/page.tsx` and `./app/admin/my-community/page.tsx` utilize a unified 12-column split-card responsive architecture: a left dark charcoal branding card (`lg:col-span-4 bg-[#141518] text-white rounded-[28px] p-6 sm:p-8 flex flex-col justify-between`) displaying entity badges, WebP avatar/logo preview, name, and role permissions; paired with a right white card (`lg:col-span-8 bg-white border border-neutral-200 rounded-[28px] p-6 sm:p-8`) containing organized form inputs and save actions.
* **Closed Slot Privacy Shield & Cross-Community RBAC:** In `./app/components/GoogleCalendarView.tsx`, closed/draft slots (`status === 'closed'`) are completely hidden from public calendar views (`isAdminMode: false`). In Admin Mode, when a lead from another community clicks a reserved slot, event details (title, description, venue, perks, links) are masked; only `Slot Reserved`, reserving community name, date, and time slot are displayed. Edit/delete/publish controls and full slot details are strictly restricted to the owning community and Superadmins.
* **College Institutional Entity Isolation:** "College" is filtered out from public community directory listings (`./app/community/page.tsx`) and admin community management cards (`./app/admin/communities/page.tsx`) so it is not displayed or managed as a standard student community. In slot booking (`./app/admin/events/page.tsx`), selection of "College" as an organizer option is strictly restricted to Superadmins (`dev` and `admin` roles) under a dedicated `Institutional Entity` optgroup.
* **Event Format Selector & Popup Badges:** In `./app/admin/events/page.tsx`, slot booking modal includes an **Event Format / Mode** selector (`Offline`, `Online`). Format is stored as part of venue (`Offline • ...`, `Online • ...`) and displayed as a clean text badge (`Offline` / `Online`) in event popups (`./app/components/GoogleCalendarView.tsx`) and public detail pages (`./app/events/[id]/page.tsx`).
* **Custom Registration Link & Conditional Button:** In `./app/admin/events/page.tsx`, slot booking modal includes an optional `Registration / Form Link (Optional)` input field (`redirect_url`). In `./app/events/[id]/page.tsx`, the **Register Now** button is ONLY rendered when `redirect_url` is explicitly provided, suppressing default form fallbacks.
* **Admin Section Architecture & Flux Dashboard Theme ([app/admin/](./app/admin/)):**
  - **Layout & Structure ([app/admin/layout.tsx](./app/admin/layout.tsx)):** Full-width, full-height viewport canvas (`min-h-screen w-full bg-[#edf0f4] flex flex-col md:flex-row`) featuring a sticky dark sidebar (`bg-[#18191c] w-64 lg:w-72 sticky top-0 h-screen overflow-y-auto`), a top header navigation bar (user profile pill with avatar, search input bar, notification bell button, and date badge), and light grey workspace canvas (`#edf0f4`).
  - **Sidebar Component ([app/components/AdminSidebar.tsx](./app/components/AdminSidebar.tsx)):** Sticky dark charcoal container featuring active link floating white rounded pill cards (`bg-white text-[#141518] font-extrabold rounded-full px-5 py-3 shadow-lg`) with dark active indicator dots, dark hover links, and a bottom system card (`bg-[#24262b] rounded-[24px] p-5 border border-neutral-800`) with a white "Public View" action button.
  - **Overview Dashboard ([app/admin/page.tsx](./app/admin/page.tsx)):** Features white metric cards (`bg-white rounded-[28px] p-6 shadow-sm border border-neutral-200/60`), dark feature cards (`bg-[#18191c] text-white rounded-[28px] p-6 sm:p-8 shadow-xl`), and quick action pill buttons.
  - **Admin Pages Integration ([app/admin/events/page.tsx](./app/admin/events/page.tsx), [app/admin/communities/page.tsx](./app/admin/communities/page.tsx), [app/admin/my-community/page.tsx](./app/admin/my-community/page.tsx), [app/admin/users/page.tsx](./app/admin/users/page.tsx)):** All admin pages converted to the Flux theme with white card surfaces, rounded pill buttons, and monochrome/indigo typography, while keeping public pages and Google Calendar rendering completely untouched.
* **Poster Upload Dual Storage & Live Progress:** `./lib/upload.ts` converts images to WebP, tracks upload progress via `XMLHttpRequest` (`upload.onprogress`), and attempts Vercel Blob API (`/api/upload`) with an automatic fallback to Supabase Storage `posters` bucket for 100% upload reliability. Displays live percentage (`Uploading 65%...`) and progress bar in `./app/admin/events/page.tsx`.
* **Dev / Superuser RBAC Protection:**
  - `./app/admin/users/page.tsx`: Filters out `dev` profiles from non-dev views and hides `Dev (Super Admin)` role selection options.
  - `./app/api/admin/users/route.ts`: Server-side authorization validation returning `403 Forbidden` if a non-dev user attempts to create, modify, or delete a `dev` user.
* **Public Summarizers & Description Parser:** `./lib/summary.ts` generates clean 2-line summary cards. Description parser in `./app/events/[id]/page.tsx` uses lookbehind regex (`/(?<=[.!?])\s+|\n+/`) to extract 3 clean sentences.
* **Fast AI Engine & Drawer Chat UI:** `./app/api/chat/route.ts` using `gemini-1.5-flash` with 4-second `AbortController` timeouts. `./app/components/EventAiDrawer.tsx` features `renderFormattedMessage` parsing markdown bold syntax (`**text**`) into styled `<strong>` tags. Includes offline fallback parser (`generateOfflineResponse`).
* **Authentication:** Supabase Auth with Dual Login Modes: 6-Digit Email OTP verification & Password Authentication (`./app/login/page.tsx`).

---

## 3. Database Schema & Supabase Table Definitions

### `events` Table
```sql
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  category TEXT NOT NULL DEFAULT 'Workshop',
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  event_date DATE NOT NULL,
  time_slot TEXT DEFAULT '10:00 AM - 04:00 PM',
  venue TEXT DEFAULT 'Campus Setup / CEV',
  status TEXT DEFAULT 'closed', -- 'closed' (draft slot) | 'live' (published)
  description TEXT,
  perks TEXT,
  poster_url TEXT,
  system_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `communities` Table
```sql
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  description TEXT,
  logo_url TEXT,
  initials TEXT,
  color TEXT DEFAULT '#6366f1', -- Community signature color hex code
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed System College Entity for College Events, Exams & Academic Schedules
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.communities WHERE slug = 'college' OR name = 'College') THEN
    UPDATE public.communities
    SET name = 'College',
        slug = 'college',
        description = 'Official College Academic Events, Exams, and Schedules',
        initials = 'CLG',
        color = '#0ea5e9'
    WHERE slug = 'college' OR name = 'College';
  ELSE
    INSERT INTO public.communities (name, slug, description, initials, color)
    VALUES ('College', 'college', 'Official College Academic Events, Exams, and Schedules', 'CLG', '#0ea5e9');
  END IF;
END $$;
```

### `profiles` Table
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'editor', -- 'dev' | 'admin' | 'manager' | 'editor'
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. Role-Based Access Control (RBAC) Matrix

| User Role | Access User Roles (`/admin/users`) | Access Communities (`/admin/communities`) | Book College Slots & Categories | Modify Dev (`dev`) Users | Community Entity Editing | Create / Edit Events | Delete Events | Toggle Event Status (`closed`/`live`) | Access AI Chat |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Dev (Super Admin)** | ✅ (All Users) | ✅ | ✅ (College, Exams, Schedules) | ✅ | ✅ (Full Name, Slug, Logo, Desc, Color) | ✅ (All + Venue Input) | ✅ (All) | ✅ (All) | ✅ |
| **Admin** | ✅ (Non-Dev Users) | ✅ | ✅ (College, Exams, Schedules) | ❌ (Forbidden) | ✅ (Full Name, Slug, Logo, Desc, Color) | ✅ (All + Venue Input) | ✅ (All) | ✅ (All) | ✅ |
| **Manager (Lead)** | ✅ (Own Leads) | ❌ | ❌ (Strictly Forbidden) | ❌ (Forbidden) | ✅ (Own Community) | ✅ (Own Community) | ✅ (Own Community) | ✅ (Own Community) | ✅ |
| **Editor** | ❌ | ❌ | ❌ (Strictly Forbidden) | ❌ (Forbidden) | ❌ | ✅ (Own Community) | ❌ | ✅ (Own Community) | ✅ |
| **Public User** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 5. Complete Directory Layout & Relative File References

```
event-manager/
├── .agents/
│   └── AGENTS.md                  # Developer agent workspace rules & guidelines
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── my-community/
│   │   │   │   └── route.ts       # Manager level community update API endpoint
│   │   │   └── users/
│   │   │       └── route.ts       # Supabase Auth + Profiles admin management API endpoint with Dev role guards
│   │   ├── chat/
│   │   │   └── route.ts           # Ultra-fast gemini-1.5-flash AI chat endpoint
│   │   ├── profile/
│   │   │   └── route.ts           # Self profile update API route
│   │   └── upload/
│   │       └── route.ts           # Vercel Blob API upload route (@vercel/blob put)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts           # Supabase Auth code exchange handler
│   ├── admin/
│   │   ├── layout.tsx             # Protected Admin layout with standalone sticky sidebar & sign-out
│   │   ├── page.tsx               # Admin Dashboard overview metrics
│   │   ├── communities/
│   │   │   └── page.tsx           # Community Management with color pickers, modals & WebP upload
│   │   ├── events/
│   │   │   └── page.tsx           # Admin booking engine integrated with Google Calendar Slot View
│   │   ├── my-community/
│   │   │   └── page.tsx           # Assigned community lead manager portal
│   │   ├── profile/
│   │   │   └── page.tsx           # User profile & avatar WebP upload page
│   │   └── users/
│   │       └── page.tsx           # Community Leads & Team Management Console with Dev protection
│   ├── calendar/
│   │   └── page.tsx               # Google Calendar view route (Month, Week, Day grids)
│   ├── components/
│   │   ├── AdminSidebar.tsx       # Standalone admin sidebar component with sticky viewport layout isolation
│   │   ├── ConFooter.tsx          # Global conditional Footer wrapper hiding footer on /admin & /login
│   │   ├── ConNav.tsx             # Global conditional Navbar wrapper hiding main navbar on /admin
│   │   ├── EventAiDrawer.tsx      # z-[200] Event Assistant drawer with body scroll lock
│   │   ├── Footer.tsx             # Developer credits footer with GitHub, LinkedIn, Website, Email & UPI Coffee sponsor button
│   │   ├── GoogleCalendarView.tsx # Interactive Google Calendar with multi-day connected banners & W3C luminance text contrast
│   │   ├── MasterCalendar.tsx     # Master event list timeline with 2-line summary cards & community colors
│   │   ├── Navbar.tsx             # Floating navbar with vector badge & single Calendar CTA button
│   │   └── SmoothScroll.tsx       # Lenis smooth scroll provider setup
│   ├── events/
│   │   ├── page.tsx               # Public events directory
│   │   └── [id]/
│   │       └── page.tsx           # Dynamic event detail page with 3-line sentence description overview
│   ├── login/
│   │   └── page.tsx               # Password Auth & 6-Digit Email OTP Login
│   ├── page.tsx                   # Public landing page with clean production-ready code
│   └── layout.tsx                 # Root layout with next/font/local (Quera, Gued, Rondured)
├── next.config.ts                 # Next.js configuration with remotePatterns for Vercel Blob Storage
├── proxy.ts                       # Next.js 16 Proxy file for session refresh & admin security
├── fonts/                         # Custom font binaries (.otf, .ttf)
├── lib/
│   ├── auth/
│   │   └── rbac.ts                # Dynamic RBAC matrix permission rules
│   ├── hooks/
│   │   ├── useCommunities.ts      # Real-time Supabase hook for communities
│   │   ├── useProfiles.ts         # Real-time Supabase hook for user profiles
│   │   └── useRealtimeEvents.ts   # Real-time Supabase hook for events joined with communities color
│   ├── summary.ts                 # Clean 2-line public summary generator
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client creator
│   │   ├── middleware.ts          # Edge cookie session updater & protected route proxy
│   │   └── server.ts              # Server Supabase client creator
│   └── upload.ts                  # Client-side WebP image converter & Vercel Blob API uploader
├── public/
│   └── fonts/                     # Public font binaries for fallback web loading
├── CHANGELOGS.md                  # Versioning history & release notes
├── CONTRIBUTORS.md                # Creator attribution, live GitHub contributor tracking & rules
├── DESIGN.md                      # Design system tokens, color specifications & motion standards
├── LICENSE                        # Official MIT License for Shibili Aman TK
├── PROJECT_MEMORY.md              # Technical program memory (this file)
├── README.md                      # Technical setup & developer guide
└── SECURITY.md                    # Security policy & vulnerability reporting guide
```
