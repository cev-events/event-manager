# Changelogs & Version History

## [2.2.0] - 2026-08-16

### 🤖 AI Agent UI Modernization, Public Event Mobile Poster Ordering & Mobile Lenis Scroll Bypass
- **Modern AI Drawer Agent UI ([app/components/EventAiDrawer.tsx](./app/components/EventAiDrawer.tsx)):**
  - Upgraded drawer interface with modern dark glassmorphic panel styling (`bg-[#0c0d12]`, `#141722` message cards, subtle radial glow, `border-white/10`).
  - Added dynamic mobile viewport height (`h-[100dvh] max-h-[100dvh]`) to eliminate mobile browser address bar height bugs.
  - Added safe-area bottom inset padding (`pb-safe`) for iOS dynamic navigation bars and mobile virtual keyboards.
  - Added live status pulse dot ("Live Assistant"), model context tag ("Online • Gemini Engine"), conversation reset button (`RotateCcw`), and 44px touch target close button.
  - Built full Markdown renderer (`renderFormattedMessage`) supporting headers (`###`), bold text (`**text**`), inline code (`` `code` ``), bullet lists (`- ` / `* `), and numbered lists (`1. `).
- **Public Event Slug Page Mobile Poster Reordering ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):**
  - Updated responsive CSS grid layout: poster image container is ordered FIRST (`order-1 lg:order-2 lg:col-span-5`) on mobile screens (`< lg`), placing the 3:4 aspect poster above event details, and content SECOND (`order-2 lg:order-1 lg:col-span-7`).
  - Preserved 7-column content (left) and 5-column poster (right) layout on desktop viewports (`>= lg`).
  - Enhanced contrast and typography across event detail cards.
- **Mobile Lenis Scroll Bypass ([app/components/SmoothScroll.tsx](./app/components/SmoothScroll.tsx)):**
  - Added mobile device detection (`window.innerWidth < 768` or `(max-width: 767px)` media query).
  - Bypasses Lenis scroll loop exclusively on mobile screens to guarantee 100% smooth, native touch scrolling.

## [2.1.0] - 2026-08-12

### ⚡ Bearer Session Authorization & Manager Community User Resolution Fix
- **Bearer Token Authorization ([app/admin/users/page.tsx](./app/admin/users/page.tsx)):** Updated `fetchProfiles()` to explicitly pass `Authorization: Bearer ${session.access_token}` header from Supabase Auth client.
- **Server SSR Session Resolution ([app/api/admin/users/route.ts](./app/api/admin/users/route.ts)):** Upgraded `getRequesterProfile` to resolve user sessions using `@supabase/ssr` with `cookies()` alongside Bearer token headers, guaranteeing 100% reliable session resolution.
- **Manager Community Users Resolution:** Fixed timing dependency so Community Managers instantly see all managers and editors belonging to their own assigned community.

## [2.0.0] - 2026-08-12

### 🔒 Complete Strict RBAC Hierarchy Enforcement & Cross-Device Performance Optimization
- **Strict Role Visibility Hierarchy ([app/admin/users/page.tsx](./app/admin/users/page.tsx), [app/api/admin/users/route.ts](./app/api/admin/users/route.ts)):**
  - **Dev (Superadmin):** Can see and edit ALL user roles (`dev`, `admin`, `manager`, `editor`) and manage all community entities.
  - **Admin:** Can see and edit ALL users EXCEPT Superadmin (`dev` accounts are strictly hidden and protected from modifications).
  - **Manager (Lead):** Can ONLY see, create, and edit managers and editors belonging to **their own community** (`community_id === currentUserCommunityId`). Dev, Admin, and users from other communities are completely hidden from Manager views. Server API returns `403 Forbidden` for out-of-scope actions.
  - **Editor:** Blocked and redirected from `/admin/users` page. Has read-only visibility on `/admin/my-community` (inputs disabled, save button hidden). Can create events/book slots in `/admin/events`, but event deletion is strictly forbidden (`handleDeleteEvent` blocked).
- **Smoothness & Performance Optimization:** Ensured zero cumulative layout shift (CLS), smooth Lenis scroll container isolation (`data-lenis-prevent`), memoized filtering, and optimal performance across mobile, tablet, and desktop viewports.

## [1.9.0] - 2026-08-12

### 📱 Mobile Viewport Fixes, Portal Modals & Manager Security Enforcement
- **Manager Community Scope Security ([app/admin/users/page.tsx](./app/admin/users/page.tsx), [app/api/admin/users/route.ts](./app/api/admin/users/route.ts)):** Restricted Community Managers to viewing, creating, updating, and deleting team members strictly within their assigned community (`community_id === currentUserCommunityId`). Server API checks return `403 Forbidden` if a manager attempts to modify an account outside their community.
- **Screen-Optimized Portal Modals ([app/admin/communities/page.tsx](./app/admin/communities/page.tsx), [app/admin/users/page.tsx](./app/admin/users/page.tsx)):** Upgraded all community and user management modals to render via `createPortal(..., document.body)` with `data-lenis-prevent` backdrop, `z-[99999]`, sticky headers, and compact 2-column mobile input grids (`grid grid-cols-1 sm:grid-cols-2 gap-3`), eliminating long vertical scrolling on mobile phone screens.
- **Mobile Navbar Z-Index Adjustment ([AdminSidebar.tsx](./app/components/AdminSidebar.tsx)):** Updated mobile floating glass navbar z-index to `z-40` so that overlay modal dialogs (`z-50` / `z-[99999]`) render cleanly over the mobile bottom navigation bar without overlapping action buttons.
- **Split-Card My Community Page ([app/admin/my-community/page.tsx](./app/admin/my-community/page.tsx)):** Redesigned the assigned community settings page into a modern 12-column split-card layout matching `profile/page.tsx`: left dark charcoal brand identity card (`lg:col-span-4 bg-[#141518]`) and right white form inputs card (`lg:col-span-8 bg-white`).

## [1.8.0] - 2026-08-12

### ⚡ Flux Admin Dashboard Theme & Workspace Redesign
- **Sticky Dark Charcoal Sidebar ([app/components/AdminSidebar.tsx](./app/components/AdminSidebar.tsx)):** Built sticky dark charcoal sidebar (`bg-[#18191c] w-64 lg:w-72 sticky top-0 h-screen overflow-y-auto`) with active link floating white rounded pill cards (`bg-white text-[#141518] font-extrabold rounded-full px-5 py-3 shadow-lg`), dark indicator dots, and bottom promo card (`bg-[#24262b] rounded-[24px]`).
- **Workspace Canvas Layout & Header ([app/admin/layout.tsx](./app/admin/layout.tsx)):** Full-viewport light grey workspace canvas (`bg-[#edf0f4] min-h-screen w-full flex flex-col md:flex-row`) with top navigation header bar featuring user profile pill with avatar, search input bar, notification bell button, and date badge.
- **Overview Dashboard Cards ([app/admin/page.tsx](./app/admin/page.tsx)):** Designed white metric cards (`bg-white rounded-[28px] p-6 shadow-sm border border-neutral-200/60`), dark feature cards (`bg-[#18191c] text-white rounded-[28px] p-6 sm:p-8 shadow-xl`), and quick action pill buttons.
- **Admin Pages Theme Integration ([app/admin/events/page.tsx](./app/admin/events/page.tsx), [app/admin/communities/page.tsx](./app/admin/communities/page.tsx), [app/admin/my-community/page.tsx](./app/admin/my-community/page.tsx), [app/admin/users/page.tsx](./app/admin/users/page.tsx)):** Converted all admin management pages to the Flux theme with white card surfaces, rounded pill buttons, and monochrome typography, while keeping public pages and Google Calendar rendering completely untouched.

---

## [1.7.0] - 2026-08-12

### 💎 Public Pages Redesign & Nixtio Swiss Editorial UI Upgrade
- **Hero Scroll Shrink Animation ([app/page.tsx](./app/page.tsx)):** Added smooth dynamic scroll shrink transition (`w-[99%]` to `w-[95%]`, `min-h-[99vh]` to `min-h-[75vh]`, `rounded-[1.3rem]` to `rounded-[1rem]`) with `cubic-bezier(0.16, 1, 0.3, 1)` easing. Title dynamically resizes from `text-[15rem]` to `text-[10rem]`.
- **Public Navigation Bar 3-State Modes ([Navbar.tsx](./app/components/Navbar.tsx)):** Updated scroll detection via `getBoundingClientRect()` relative to `#hero-section`. Auto-switches `/cev_logo.svg` (white) and `/cev_logo_b.svg` (black). Features spaced-out links on top dark hero, compact white glass floating pill (`bg-white/70 backdrop-blur-2xl border border-white/70`) on scroll, and CTA color switching.
- **Communities & Timeline Grids ([app/page.tsx](./app/page.tsx)):** Expanded communities section to a 6-column `max-w-[1800px]` grid with `rounded-[24px]` cards. Expanded schedules timeline to 3-column `min-h-[680px]` cards featuring image poster overlay, dark gradient, category/community badges, and 300ms rotating arrow CTAs.
- **Events Directory & Public Shielding ([app/events/page.tsx](./app/events/page.tsx), [MasterCalendar.tsx](./app/components/MasterCalendar.tsx)):** Set page container width `w-[96%] mx-auto` with centered loading spinner. Enforced public shielding: hides draft events (`status !== 'live'`) and suppresses `college schedule` & `exam` categories in public view. Renders `aspect-[3/4] rounded-[24px]` cards with poster hover zoom (`scale-105`), dark gradient overlay, category/status badges, and YIQ high-contrast community text.
- **Communities & Detail Pages ([app/community/page.tsx](./app/community/page.tsx), [app/community/[id]/page.tsx](./app/community/[id]/page.tsx)):** Redesigned community list into 3-column `min-h-[430px] rounded-[24px]` cards with `001` index badges, logo container (`w-20 h-20`), title hover offset (`group-hover:translate-x-1`), and arrow rotation. Redesigned detail page hero (`min-h-[560px] bg-white rounded-[28px]`, radial blur, `w-32 h-32` logo container) and editorial events list (`01`, `02` index numbers, bold typography, hover slide arrow button).
- **Support & Bug Report Page ([app/support/page.tsx](./app/support/page.tsx)):** Cleaned up back link navigation. Updated form container styling (`bg-white rounded-[28px] p-8 sm:p-12 shadow-sm border border-neutral-200`) and dark emerald/rose contrast badges.
- **Global Page Entrance Animations ([app/template.tsx](./app/template.tsx)):** Added Framer Motion page entrance transitions (`initial={{ opacity: 0, y: 24, filter: 'blur(5px)' }}`, `animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}`, `transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}`).

---

## [1.6.0] - 2026-08-12

### 🎨 Nixtio Hero Card 4-Corner Container & Smooth Scroll Corner Transitions
- **State 1: 4-Corner Rounded Hero Card Container ([app/page.tsx](./app/page.tsx)):** Re-architected hero container to sit inside outer container padding (`px-3 sm:px-5 lg:px-6 pt-3 sm:pt-5`) with **ALL 4 CORNERS ROUNDED** (`rounded-[2.2rem] sm:rounded-[3rem] lg:rounded-[3.5rem]`), matching Nixtio's exact initial State 1 layout.
- **State 2: Smooth Side Adjustments on Scroll ([Navbar.tsx](./app/components/Navbar.tsx), [app/page.tsx](./app/page.tsx)):** Added smooth CSS transitions (`transition-all duration-500 ease-out`) for container padding and navbar alignment as the page scrolls down.
- **State 3: Curved Bottom Corner Boundary ([app/page.tsx](./app/page.tsx)):** Verified curved bottom corners (`rounded-b-[2.5rem] sm:rounded-b-[3.5rem]`) overlaying white page content below.

---

## [1.5.0] - 2026-08-12

### 🎯 3 Nixtio Navbar Transition Modes, /cev_logo_b.svg Auto-Switch & Edge-to-Edge Full Screen Hero
- **Standalone Brand Logo with Auto-Color Switch ([Navbar.tsx](./app/components/Navbar.tsx)):** Removed circular background box around logo icon. Logo renders standalone (`/cev_logo.svg` in white over dark hero, auto-switching to `/cev_logo_b.svg` in black over light page content).
- **The 3 Nixtio Navbar Transition Modes ([Navbar.tsx](./app/components/Navbar.tsx)):**
  1. **Mode 1 (Initial Top State over Dark Hero)**: Standalone white logo, transparent spaced-out white text links (`Events`, `Calendar`, `Communities`, `Support`), white CTA button (`Login` / `Dashboard`).
  2. **Mode 2 (Scrolled Over Dark Hero)**: Standalone white logo, center nav transforms into a floating **WHITE PILL CONTAINER** (`bg-white text-black border border-neutral-200 rounded-full px-6 py-2 shadow-xl backdrop-blur-md`), white CTA button.
  3. **Mode 3 (Scrolled Over Light Page Content)**: Standalone black logo (`/cev_logo_b.svg`), center nav in floating **WHITE PILL CONTAINER**, CTA button transforms into a **BLACK PILL BUTTON** with white text.
- **Edge-to-Edge Full Screen Hero Section ([app/page.tsx](./app/page.tsx)):** Re-architected hero container to 100vw, 100vh full viewport width and height (`w-full min-h-screen h-screen`), floating navbar layered above hero content, with title (`CEV EVENTS`) and content alignment matching Nixtio web.

---

## [1.4.0] - 2026-08-12

### 🚀 Nixtio Floating Scroll Navbar & Logo-Only Brand Update
- **Logo-Only Brand Icon ([Navbar.tsx](./app/components/Navbar.tsx)):** Removed text name from the navbar header as requested, leaving only the clean `cev_logo.svg` icon in a dark rounded pill.
- **Nixtio White Pill Scroll Transition ([Navbar.tsx](./app/components/Navbar.tsx)):** Implemented Nixtio's dynamic scroll animation. When scrolling past 40px, the center navigation menu smoothly transforms into a floating white glass pill container (`bg-white/95 text-black border border-neutral-200/80 rounded-full px-5 py-1.5 shadow-xl backdrop-blur-md transform scale-95`) with crisp dark typography.
- **Black CTA Button with White Text**: Styled the `Login` / `Dashboard` CTA button as a black rounded pill with white text.

---

## [1.3.0] - 2026-08-12

### 🎨 Re-Architected Google Calendar Continuous Multi-Day Banner Lines
- **Google Calendar Week-Row Banner Architecture ([GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Re-architected Month View to use a 7-column CSS grid week-row structure (`grid grid-cols-7`). Multi-day events now render as **ONE single continuous horizontal banner bar** per week row (`gridColumn: `${colStart} / span ${colSpan}``) with zero gaps, matching Google Calendar's exact UI design.
- **Single Title Rendering at Start**: Title text is displayed once at the start of each continuous banner line, eliminating duplicate per-cell text chips.

---

## [1.2.0] - 2026-08-12

### 🐛 Fixed Calendar Full Width Viewport Layout & Multi-Day Date Range Parser
- **Full Width 7-Column Grid Layout ([GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Added `min-w-0` to main flexbox containers. Resolved column clipping so all 7 day columns (`SUN`, `MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT`) stretch 100% full width across the viewport with zero right-side cutoff.
- **Universal Multi-Day Date Range Scanner ([GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Updated `getEventStartEndIso` helper to regex scan all text attributes (`date`, `event_date`, `description`, `title`) for date range patterns (`YYYY-MM-DD to YYYY-MM-DD` or `YYYY-MM-DD - YYYY-MM-DD`). Events like **Series Exam 1** (Aug 18-20) and **Onam Vacation** (Aug 22-30) now accurately render continuous horizontal banners across every day in their active date range.

---

## [1.1.0] - 2026-08-12

### 📅 Calendar Grid View Mode, Multi-Day Event Continuous Banners & Contrast Text Colors
- **Grid View Mode ([GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Implemented rich `Grid` view mode in the calendar view mode dropdown (`Month`, `Week`, `Day`, `Grid`), rendering a responsive multi-column card directory of all master campus schedules.
- **Dynamic Contrast Text Colors ([GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Implemented relative YIQ luminance contrast calculation (`getContrastTextColor`). Automatically sets text color to `#0a0a0a` (dark) when community color is light (yellow, white, cyan, light lime, amber) and `#ffffff` (white) when dark.
- **Multi-Day Banner Visibility Across All Days ([GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Refined multi-day event date range resolution (`getEventStartEndIso`). Ensures multi-day events render continuous horizontal banner spans across every day in their active date range with readable titles on all days.
- **Mobile Responsive Optimization ([GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Added touch-friendly mobile layouts (`overflow-x-auto min-w-full`, compact dropdown selectors, and responsive padding) for mobile screens.

---

## [1.0.0] - 2026-08-12

### 🔒 Strict Non-Live / Draft Event Public Access Restriction
- **Public Directory Live Filtering ([MasterCalendar.tsx](./app/components/MasterCalendar.tsx)):** Enforced strict `evt.status === 'live'` filtering on public event listings (`/events`). Non-live, closed, draft, or reserved slot events are never displayed in public discovery view regardless of user login status.
- **Direct Event Detail Page Shield ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):** Implemented strict status check on public detail route `/events/[id]`. Accessing a non-live event directly displays an `Event Access Restricted` banner blocking access for all public users and logged-in admins on public routes.
- **Landing & Community Page Filter Alignment ([app/page.tsx](./app/page.tsx), [app/community/[id]/page.tsx](./app/community/[id]/page.tsx)):** Ensured upcoming schedules and community event lists exclusively render published `live` events.

---

## [0.99.0] - 2026-08-11

### ✨ Full-Screen Hero Viewport, Black CTA Button & Navbar Scroll Animations
- **Full-Screen Hero Height ([app/page.tsx](./app/page.tsx)):** Expanded dark hero section to full viewport height (`min-h-[88vh] sm:min-h-[92vh]`) with giant display text **`CEV EVENTS`**.
- **Black CTA Button with White Text ([Navbar.tsx](./app/components/Navbar.tsx)):** Changed `Login` / `Dashboard` CTA button styling to a sleek black pill button with white text (`bg-black text-white border border-neutral-700 hover:bg-neutral-900 rounded-full px-5 py-2`).
- **Navbar Scroll Animations ([Navbar.tsx](./app/components/Navbar.tsx)):** Added scroll listener and smooth scale transitions (`scale-95`, `backdrop-blur-md`) when scrolling down the page.

---

## [0.98.0] - 2026-08-11

### 🎨 Nixtio Hero Section, Header GIF Integration & Client Logo Club Grid
- **Nixtio Hero Header Section ([app/page.tsx](./app/page.tsx)):** Reconstructed hero section with giant **`CEV EVENTS`** headline, animated background GIF (`header.gif`), stats metadata (`50+ Campus Events`, `10+ Tech Communities`, `CE Vadakara`), and clean rounded action buttons (`EXPLORE EVENTS`, `VIEW CALENDAR`).
- **Black Pill Floating Navbar ([Navbar.tsx](./app/components/Navbar.tsx)):** Updated header to a floating black pill navigation bar (`bg-black/95 text-white border-neutral-800 rounded-full px-6 py-2 shadow-xl`) with white text and `Login` CTA button.
- **Client-Style Student Club Grid ([app/page.tsx](./app/page.tsx)):** Reorganized student communities into a clean grid of white rounded cards (`bg-white rounded-2xl border border-neutral-200 p-6`) displaying club logos and titles, matching the Nixtio "Our clients" reference UI.

---

## [0.97.0] - 2026-08-11

### 🚀 Full-Screen Edge-to-Edge Public Calendar, Login Redesign & Admin UI Alignment
- **Full-Screen Dark Public Calendar ([app/calendar/page.tsx](./app/calendar/page.tsx)):** Set background to `#0a0a0a` charcoal dark theme, removed side container padding and max-width boundaries for a 100% full-screen edge-to-edge Google Calendar view.
- **Robust Multi-Day Date Parsing ([GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx), [useRealtimeEvents.ts](./lib/hooks/useRealtimeEvents.ts)):** Implemented `getEventStartEndIso` helper to automatically parse date ranges (`start_date`, `end_date`, `2026-08-22 to 2026-08-26`, `2026-08-22 - 2026-08-26`). Events now render continuous horizontal banners across all days.
- **Navbar CTA Login Button ([Navbar.tsx](./app/components/Navbar.tsx)):** Replaced `Book Slot` button text in header with `Login` pointing directly to `/login`.
- **Redesigned Admin Login Page ([app/login/page.tsx](./app/login/page.tsx)):** Updated header title to **`Admin Portal Login`**, updated placeholder to `admin@cev.ac.in`, and modernized card container with `#0a0a0a` background, `bg-neutral-900 border border-neutral-800` card, and clean white pill buttons.
- **System-Wide Admin Page Redesign ([/admin/users](./app/admin/users/page.tsx), [/admin/communities](./app/admin/communities/page.tsx), [/admin/profile](./app/admin/profile/page.tsx)):** Replaced legacy dark blue/indigo borders and glowing card outlines with clean dark neutral containers (`bg-neutral-900 border border-neutral-800 rounded-2xl`) and white pill action triggers (`bg-white text-[#0a0a0a] rounded-full`).
- **Public Support Page Alignment ([app/support/page.tsx](./app/support/page.tsx)):** Updated support ticket form container to clean off-white card styling (`bg-white border border-neutral-200 shadow-sm rounded-2xl`).

---

## [0.96.0] - 2026-08-11

### 📅 Streamlined Public Calendar Page & Full-Width Layout
- **Streamlined Public Calendar Page ([app/calendar/page.tsx](./app/calendar/page.tsx)):** Removed top title headers, badges, and description text from `/calendar`. Rendered an expansive full-width Google Calendar view (`max-w-[1400px]`) followed directly by the footer.
- **Continuous Multi-Day Banner Polish ([GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Refined multi-day event banner boundaries to span continuously across cell walls without gaps, matching Google Calendar dark mode.

---

## [0.95.0] - 2026-08-11

### 📅 Authentic Google Calendar Dark UI & Navbar Calendar Integration
- **Navbar Links Alignment ([app/components/Navbar.tsx](./app/components/Navbar.tsx)):** Replaced `Schedules` with `Calendar` in top floating pill navigation bar (`Events`, `Calendar`, `Communities`, `Support`).
- **Google Calendar Dark Mode UI Adaptation ([GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):**
  - **Top Navigation Bar:** Built authentic Google Calendar header with hamburger menu icon, blue day badge `11`, `Calendar` header, `Today` rounded pill button, `< >` navigation chevrons, Month/Year header (`August 2026`), View selector pill (`Month ▾`, `Week`, `Day`, `Grid`), and `+ Book Slot` button.
  - **Left Sidebar Panel:** Added top `+ Create Slot` pill button, interactive Mini Month Calendar datepicker widget (`S M T W T F S` with today highlighted in a blue circle badge `11`), "Search for people / communities" input, and "My calendars" community filter list with brand swatches.
  - **Dark Obsidian Canvas & Grid:** Applied `#131314` deep dark grid background with `#28292c` borders and filled event chips matching Google Calendar's exact visual style.
  - **Public & Admin Calendar Parity ([app/calendar/page.tsx](./app/calendar/page.tsx), [app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Applied full Google Calendar UI adaptation to both public `/calendar` and admin `/admin/events` pages while preserving 100% of RBAC, slot confidentiality shield, multi-day calculations, and backend database operations.

---

## [0.94.0] - 2026-08-11

### 🎨 System-Wide Component Modernization & Centered Loading Logo
- **Centered Brand Loading Screen ([app/components/LoadingScreen.tsx](./app/components/LoadingScreen.tsx)):** Removed top header strip and bottom footer text from loading screen. Placed official `cev_logo.svg` prominently in the center with smooth pulsing animation, clean progress percentage (`0% -> 100%`), and minimalist progress bar.
- **Component Modernization Across MasterCalendar & EventAiDrawer ([MasterCalendar.tsx](./app/components/MasterCalendar.tsx), [EventAiDrawer.tsx](./app/components/EventAiDrawer.tsx)):** Re-architected MasterCalendar cards into clean off-white containers (`bg-white border border-neutral-200 shadow-sm rounded-2xl`). Updated EventAiDrawer to dark neutral styling (`bg-[#0a0a0a] border-neutral-800`) and removed Sparkles icons.
- **Full Page Detail & Dashboard Card Polish ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx), [app/community/[id]/page.tsx](./app/community/[id]/page.tsx), [app/admin/page.tsx](./app/admin/page.tsx), [app/admin/my-community/page.tsx](./app/admin/my-community/page.tsx)):** Eliminated legacy brutalist card shadows and outdated background tokens. Applied unified Nixtio dual theme (`#f5f5f5` off-white public body, `#0a0a0a` dark hero/admin).

---

## [0.93.0] - 2026-08-11

### 🎨 Nixtio Dual Light/Dark Theme, Floating Pill Navbar & Google Calendar UI
- **Nixtio Floating Pill Navbar ([app/components/Navbar.tsx](./app/components/Navbar.tsx)):** Re-architected navbar into a floating pill container matching `nixtio.com` (`max-w-5xl mx-auto rounded-full bg-[#0a0a0a]/90 backdrop-blur-xl border border-neutral-800`), adaptive SVG logo, clean minimal links (`Events`, `Schedules`, `Communities`, `Support`), and rounded pill CTA button.
- **Removed Unwanted Hero Strips & AI Fluff ([app/page.tsx](./app/page.tsx)):** Removed top hero strip, bottom 4-column stat strip (`05+`, `100%`, `WebP`, `2026`), `Services & Capabilities` section, and all `Sparkles` / AI fluff embellishments.
- **Renamed Event Showcase to "Schedules" ([app/page.tsx](./app/page.tsx)):** Re-architected event showcase section into **`Schedules`** with clean editorial cards on off-white background.
- **College Entity Exclusion from Chapters & Clubs ([app/page.tsx](./app/page.tsx), [app/community/page.tsx](./app/community/page.tsx)):** Filtered out "College" from student chapters and clubs listings (`c.slug !== 'college'`).
- **Google Calendar UI Alignment ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Aligned calendar interface with Google Calendar's clean toolbar, view switcher pills (`Month`, `Week`, `Day`), multi-day connected banners, and slot privacy shield.
- **Modernized Admin Dashboard ([app/admin/*](./app/admin), [app/components/AdminSidebar.tsx](./app/components/AdminSidebar.tsx)):** Updated admin consoles with clean modern neutral styling (`bg-[#0a0a0a]`, `bg-neutral-900`, `border-neutral-800`, rounded pills, no brutalist offset shadows).

---

## [0.92.0] - 2026-08-10

### 🎨 Nixtio Editorial UI Design System, Logo Integration & Global Loading Screen
- **Installed Nixtio UI Skill ([.agents/skills/ui-ux-design-system/SKILL.md](./.agents/skills/ui-ux-design-system/SKILL.md)):** Installed the Nixtio-inspired premium creative digital agency design skill featuring oversized display typography (`Quera`), numbered section markers (`001`, `002`, `003`), restrained monochrome palette (`#08090d`, `#0f121d`, `#161a29`), and gallery-style event presentation.
- **Global Logo & Favicon Integration ([public/cev_logo.svg](./public/cev_logo.svg)):** Replaced generic shield icons and text brandings across the navbar, footer, admin sidebar, login card, and Next.js browser favicon metadata with the official `cev_logo.svg` asset.
- **Global Editorial Loading Screen ([app/components/LoadingScreen.tsx](./app/components/LoadingScreen.tsx)):** Added a global editorial page-loader featuring an animated `cev_logo.svg`, live percentage counter (`0% -> 100%`), sleek progress bar, and smooth fade-out reveal animation on initial load.
- **Nixtio.com Site Structure Alignment ([app/page.tsx](./app/page.tsx)):** Directly scraped and analyzed `https://nixtio.com/` live structure. Re-architected landing page to incorporate Nixtio's Hero Poster Canvas, Client/Community Logo Strip, Expandable Numbered Service Accordions (`001 Master Calendar`, `002 AI Assistant`, `003 Multi-Community Network`, `004 WebP Asset Pipeline`), Selected Case Studies Showcase, and giant typographic stats.

---

## [0.90.0] - 2026-08-10

### 🛡️ Reserved Slot Privacy Protection & College Entity Isolation
- **Reserved Slot Confidentiality Shield ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** When non-owner community leads view or click a reserved draft slot (`status === 'closed'`), sensitive details (title, description, venue, perks, links) are masked. Clicking the slot opens a privacy-shielded modal displaying only the `Slot Reserved` status badge, reserving community name, date, and time slot.
- **Public Calendar Exclusion ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Closed/draft slots (`status === 'closed'`) are strictly excluded from public calendar views (`isAdminMode: false`). Public visitors only see live published events.
- **College Entity Isolation ([app/community/page.tsx](./app/community/page.tsx), [app/admin/communities/page.tsx](./app/admin/communities/page.tsx)):** Excluded "College" from public community directories and admin community management cards so it is not displayed or managed as a standard student community.
- **Streamlined Event Poster Upload UI ([app/admin/events/page.tsx](./app/admin/events/page.tsx), [app/admin/my-community/events/page.tsx](./app/admin/my-community/events/page.tsx)):** Removed text URL input (`Or paste URL`) from event create/edit modals. Streamlined poster image management strictly to an Upload Button with live progress bar and an image preview thumbnail with clear/remove controls.

---

## [0.89.0] - 2026-08-06

### 🎴 Grid & List Views Layout Engine for "My Events" Page
- **Grid View Cards Layout ([app/admin/my-community/events/page.tsx](./app/admin/my-community/events/page.tsx)):** Replaced calendar view on the "My Events" page with a 3-column responsive **Grid View** featuring poster image thumbnails, category badges, event dates & time slots, venue location, Offline/Online format badges, status overlays (`Live` / `Closed Draft`), and quick action buttons (`Publish`, `Edit`, `Delete`, `Public Page`).
- **Interactive List View Table:** Retained full-featured searchable and filterable table view (`List View`) with instant tab toggle switching between Grid and List view modes.

---

## [0.88.0] - 2026-08-06

### 🏛️ Dedicated "My Events" Management Page under My Community
- **Community Events Portal ([app/admin/my-community/events/page.tsx](./app/admin/my-community/events/page.tsx)):** Created a dedicated community-specific events page strictly restricted to assigned community managers and editors (`roleRequired: ['manager', 'editor']`).
- **Targeted Metrics & Dual Views:** Displays community branding banner, metric counters (Total, Live, Drafts, Online), pre-filtered Google Calendar View (`GoogleCalendarView`), and interactive List View table with search, status filters, format badges (Offline/Online), and slot booking modal pre-populated for that community.
- **Admin Sidebar Link ([app/components/AdminSidebar.tsx](./app/components/AdminSidebar.tsx)):** Added `My Events` navigation link under `My Community` navigation section.

---

## [0.87.0] - 2026-08-06

### 📬 Dynamic Super Admin Email Resolution from Database for Bug Reports
- **Database Super Admin Query ([app/api/support/route.ts](./app/api/support/route.ts)):** When a bug report or support ticket is submitted, the API dynamically queries the Supabase `profiles` table for all users with superadmin roles (`role IN ('dev', 'admin')`).
- **SMTP Notification Broadcast ([lib/email.ts](./lib/email.ts)):** Passes all retrieved superadmin email addresses to `sendSupportTicketEmail`, ensuring all active superadmins receive full report details (reporter info, description, suggestions, and screenshot attachment) via SMTP.

---

## [0.86.0] - 2026-08-06

### 📐 Day View Flex Alignment & Real-Time Poster Upload Progress
- **Day View Grid Realignment ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Replaced `grid-cols-2` 50%/50% layout with a flex container (`w-16 shrink-0` time column + `flex-1` day timeline). Aligned day date header (`Mon 17`) directly over the full-width timeline column and eliminated black empty gaps.
- **XHR Upload Progress Tracking ([lib/upload.ts](./lib/upload.ts), [app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Upgraded poster upload engine to use `XMLHttpRequest` progress events (`onprogress`), rendering a live percentage counter (`Uploading 65%...`) and an animated glassmorphic progress bar.

---

## [0.85.0] - 2026-08-06

### 🏷️ Clean Text Offline / Online Event Mode Badges & Database Migration Script
- **Event Popup Detail Modal ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Updated the `activeModalEvent` pop-up dialog to include a prominent, clean text **Offline** (`indigo`) or **Online** (`cyan`) mode badge alongside the venue location string.
- **Database DDL Migration:** Provided exact SQL commands for updating the `events` table with an `event_format` column in Supabase.

---

## [0.84.0] - 2026-08-06

### 📧 SMTP Bug Report Dispatch & Poster Upload Dual Storage Fallback
- **SMTP Bug Report Dispatch ([lib/email.ts](./lib/email.ts), [app/api/support/route.ts](./app/api/support/route.ts)):** Integrated `nodemailer` using environmental SMTP credentials (`smtp.gmail.com:465`). Every submitted bug report automatically dispatches a formatted HTML email to superadmin (`room2homies@gmail.com`) with reporter details, issue description, suggestions, and screenshot proof directly attached to the email message.
- **Dual Storage Image Upload Fallback ([lib/upload.ts](./lib/upload.ts)):** Upgraded poster image upload pipeline to first attempt Vercel Blob storage, automatically falling back to Supabase Storage `posters` bucket if Vercel Blob token is unavailable, guaranteeing 100% upload reliability.

---

## [0.83.0] - 2026-08-06

### 🐛 Bug Reporting & Support Portal with Super Admin Ticket Inbox
- **Public Support & Bug Report Page ([app/support/page.tsx](./app/support/page.tsx)):** Added a dedicated public support page collecting Name, Email, Phone, Issue Founded description, Screenshot/Proof attachment (via Supabase storage upload or image URL), and Suggestions/Feedback.
- **Footer Anchor Link ([app/components/Footer.tsx](./app/components/Footer.tsx)):** Embedded a direct anchor link (`Report Bug / Support`) in the site footer navigation.
- **Super Admin Ticket Inbox Portal ([app/admin/support/page.tsx](./app/admin/support/page.tsx)):** Created a superadmin receiver portal (`/admin/support`) strictly restricted to `dev` and `admin` roles, featuring ticket stats, status filter tabs (`Open`, `In Progress`, `Resolved`, `Closed`), search query filter, image zoom modal, real-time status updates, and ticket deletion controls.
- **Admin Sidebar Navigation ([app/components/AdminSidebar.tsx](./app/components/AdminSidebar.tsx)):** Added `Support Inbox` link with `LifeBuoy` icon under Super Admin navigation items.

---

## [0.82.0] - 2026-08-06

### 🌐 Offline & Online Event Mode Streamlining & Grid Month/Year Selectors
- **Offline / Online Mode Selector ([app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Removed the `Hybrid` option, streamlining event mode selection to **Offline** (with `MapPin` icon) and **Online** (with `Globe` icon).
- **Public & Admin Event Format Badges ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):** Updated venue cards to render crisp **Offline** (`indigo`) and **Online** (`cyan`) badges.
- **Grid View Toolbar Month/Year Selectors ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Added interactive Month and Year select dropdowns to the top header toolbar next to `< >` arrow controls, enabling direct month and year jumps from Grid View.

---

## [0.81.0] - 2026-08-06

### 🗓️ Calendar-Projected Month Grid View Synchronization
- **Strict Month Filtering ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Grid View now strictly displays events for the month and year currently selected in the calendar header toolbar (e.g. `August 2026`).
- **Inner Header Removal:** Removed redundant inner month headers within the grid layout, creating a clean 3-column card presentation synchronized with the calendar header.
- **Dynamic Header Synchronization:** Navigating between months with `<` `>` arrow buttons or date selection automatically updates Grid View to display events for that selected projected month.
- **Per-Month Pagination:** Capped 6-event pagination engine operates on the active projected month's events, resetting to Page 1 when changing months or filters.

---

## [0.80.0] - 2026-08-06

### 🔢 6-Event Grid View Pagination Engine
- **6 Events Per Page Limit ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Grid View now limits initial visible event cards to 6 per page (`EVENTS_PER_PAGE = 6`).
- **Glassmorphic Pagination Toolbar:** Added an interactive footer toolbar with **Prev / Next** buttons, **Numbered Page Pills** (`1`, `2`, `3`...), and a **Range Counter Badge** (e.g. `Showing 1 to 6 of 18 events`).
- **Filter Reset Integration:** Changing community or publishing status filters automatically resets pagination to Page 1.

---

## [0.79.0] - 2026-08-06

### 📅 Chronological Month Grouping & Calendar Order in Grid View
- **Month Section Headers & Sorting ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Grid View now sorts all filtered events chronologically by start date and groups them into clean Month & Year sections (e.g., "August 2026", "September 2026", etc.).
- **Event Count Badges:** Each month header displays a styled badge showing the count of events scheduled in that specific month.
- **Calendar Alignment:** Aligns Grid View ordering directly with calendar month chronology for seamless user browsing.

---

## [0.78.0] - 2026-08-06

### 🚀 React Portal Body Mounting & Zero-Flicker Screen Centering
- **Portal Body Mounting ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx), [app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Wrapped modal dialog overlays (`activeModalEvent` and `showModal`) in React `createPortal(..., document.body)`.
  - Detaches modal overlays from scrolling/transformed parent containers (`main`, Lenis smooth scroll).
  - Guarantees modal cards mount directly onto `document.body` and center 100% perfectly in the active viewport screen (`100vh`) regardless of page scroll height or container offset.
  - Eliminates position flickering and scrolling offset bugs permanently.

---

## [0.77.0] - 2026-08-06

### 🐛 Viewport Modal Dialog Alignment Fix
- **Modal Centering Alignment ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx), [app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Resolved an issue where flex padding offsets (`md:pl-64`) pushed modal cards down to the bottom right of the viewport when clicking events in Grid View.
  - Cleaned modal overlay layout to use viewport-wide flex alignment (`fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto`).
  - Ensures event detail popups (`activeModalEvent`) and slot booking sheets (`showModal`) remain perfectly centered horizontally and vertically across all device viewports.

---

## [0.76.0] - 2026-08-06

### 🎨 Grid View Card Selection Lift & Workspace-Centered Modal Popups
- **Grid View Card Elevation ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Selected/hovered cards in Grid View now elevate smoothly above surrounding cards (`hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] z-10`) without shifting grid layout or affecting adjacent div centers.
- **Main Workspace Modal Centering ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx), [app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Added desktop sidebar offset (`md:pl-64`) to modal overlays (`activeModalEvent` and `showModal`), centering modal popups perfectly relative to the main screen content area (without the left sidebar).
- **Backdrop Click Dismiss:** Clicking the backdrop background outside of modal dialog cards now smoothly dismisses active popups.

---

## [0.75.0] - 2026-08-06

### 📅 Calendar Day Click Navigation & Day View UX Optimization
- **Day Cell Click Navigation ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Clicking any day cell in Month View or date column header in Week View now directly navigates to **Day Mode** (`viewMode = 'day'`) for that specific date instead of directly opening the add event popup.
- **Enhanced Day Mode Experience ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):**
  - Users can view all scheduled events on that specific day in detail across the 24-hour timeline.
  - Added a prominent **"+ Book Slot"** button in the header toolbar when viewing Day Mode to easily open slot booking for the active date.
  - Clicking any empty hourly slot row in Day View opens the slot booking modal with the prefilled time slot.

---

## [0.74.0] - 2026-08-06

### 🛡️ RBAC Cross-Community Edit Protection & Event Format Selector
- **RBAC Cross-Community Edit Guard ([app/admin/events/page.tsx](./app/admin/events/page.tsx), [app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Resolved a security bug where non-superadmin leads could view and trigger edit/delete controls for events owned by other communities.
  - Enforced `isOwnCommunity` verification in `openEditModal`, `handleBookSlot`, and `GoogleCalendarView` active modal popup controls.
  - Prevents unauthorized cross-community slot modification or status toggling.
- **Event Format / Mode Selector ([app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Added a 3-option format selector (**Offline**, **Online**, **Hybrid**) with interactive badges and icons (`MapPin`, `Globe`, `Zap`) in the slot booking form.
- **Public Format Display ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):** Rendered styled **Online**, **Offline**, or **Hybrid** venue badges and icons on public event pages.

---

## [0.73.0] - 2026-08-05

### 🔗 Custom Registration Link & Conditional "Register Now" Button
- **Registration Link Form Input ([app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Added an optional input field for **Registration / Form Link** (`redirect_url`) in the slot booking & event modal sheet. Allows community admins to specify custom registration links (Google Forms, Unstop, custom site URLs).
- **Realtime Hook & Interface Sync ([lib/hooks/useRealtimeEvents.ts](./lib/hooks/useRealtimeEvents.ts), [app/components/MasterCalendar.tsx](./app/components/MasterCalendar.tsx)):** Mapped `redirect_url` property into `EventItemData` payload.
- **Conditional "Register Now" Button ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):** Suppressed default fallback to `https://forms.google.com`. The **Register Now** button is now ONLY rendered if `eventData.redirect_url` is explicitly provided and non-empty.

---

## [0.72.0] - 2026-08-05

### 🐛 Guaranteed Unique Event Slug Generation Fix
- **Unique Constraint Prevention ([app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Resolved `duplicate key value violates unique constraint "events_slug_key"` error when booking slots or creating events with duplicate titles.
  - Appends a random 5-character base36 hash (`${baseSlug}-${uniqueSuffix}`) to every generated event slug.
  - Added automatic timestamp retry fallback (`${baseSlug}-${Date.now()}`) if a database unique constraint conflict occurs on insert or update operations.

---

## [0.71.0] - 2026-08-05

### 🐛 Multi-Day Banner Button Inline-Block Width Calculation Fix
- **Explicit Width Calculations ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Resolved HTML `<button>` inline-block text content shrinking bug where multi-day cards fit-to-text width rather than spanning 100% across day cells.
  - Middle days (`!isStart && !isEnd`) now explicitly use `w-full mx-0` to bridge column borders continuously with 0px horizontal gap.
  - Start days (`isStart && !isEnd`) use `w-[calc(100%-4px)] ml-1 mr-0` to extend flush to the right cell border line.
  - End days (`!isStart && isEnd`) use `w-[calc(100%-4px)] mr-1 ml-0` to start flush at the left border line and end 4px inside the right cell.
  - Single-day events use `w-[calc(100%-8px)] mx-1` to fit inside day cells with zero grid line overflow.

---

## [0.70.0] - 2026-08-05

### 📅 Authentic Google Calendar Multi-Day Horizontal Banner System
- **Filled Horizontal Banner Bars ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Multi-day events ("Series Exam 1", "Onam Vacation") are now rendered as smooth, filled horizontal banner bars (`h-5 sm:h-6` with 85% opacity community color fill), matching Google Calendar's exact UI design:
  - Eliminates 2-line detail stacking (community name + time slot repetition) inside every middle day cell.
  - Spans continuously across month grid columns (`ml-1 mr-0` start day, `mx-0` middle days, `mr-1 ml-0` end day).
  - Single-day events continue to render as rich 2-line detail cards (`mx-1 rounded-md border box-border`) with zero border overflow.

---

## [0.69.0] - 2026-08-05

### 📅 Google Calendar Connected Multi-Day Banner System Fix
- **Connected Multi-Day Banner System ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Overhauled `getEventDatePosition` and shape classes to align with Google Calendar conventions:
  - **Start of Segment:** `ml-1 mr-0 rounded-l-md rounded-r-none border-r-0` (starts 4px inside cell, extends flush to right cell border).
  - **Middle of Segment:** `mx-0 rounded-none border-x-0` (spans 0px to 0px across column boundaries without gaps).
  - **End of Segment:** `mr-1 ml-0 rounded-r-md rounded-l-none border-l-0` (spans 0px from left border, leaves 4px margin on right with rounded right corner).
- **Strict `isActualEnd` Badge Logic:** Restricted `END` status pill badges (`bg-rose-950 text-rose-300`) to strictly render on the REAL final end date of multi-day events (`isActualEnd === true`), preventing premature `END` badges on Saturday week-row wraps.

---

## [0.68.0] - 2026-08-05

### 🐛 Calendar Single-Day & Event Banner CSS Width Overflow Fix
- **Eliminated Cell Border Bleed ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Removed `w-full` from month view event card button/div elements to prevent CSS `100% + margin` overflow (which was causing card right edges to extend 8px past the day cell's vertical border line into adjacent day cells). Single-day events now fit 100% perfectly inside their day cell borders with clean 4px margins (`mx-1 rounded-md border box-border`).

---

## [0.67.0] - 2026-08-05

### 📅 Calendar Event Ending Day Card & END Badge Fix
- **Ending Day Banner Card Styling ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Fixed date position calculations and shape classes so single-day events always render fully rounded borders (`mx-1 rounded-md border`) and multi-day ending days cleanly render rounded right corners (`mr-1 rounded-r-md border-r`).
- **Explicit END Pill Badge:** Added explicit `END` status pill badges (`bg-rose-950/90 text-rose-300 border border-rose-800`) and preserved full event titles, community names, time slots, and draft/live badges on event ending days.

---

## [0.66.0] - 2026-08-05

### 📱 Responsive Mobile Bottom Navbar Typography & Device Optimization
- **Fluid Typography & Short Label Fallbacks ([app/components/AdminSidebar.tsx](./app/components/AdminSidebar.tsx)):** Added `shortLabel` definitions (`Overview`, `Events`, `Community`, `Users`, `Communities`, `Profile`) and fluid single-line truncation styling (`text-[9px] sm:text-[10px] truncate max-w-full text-center leading-none`) to ensure the bottom navbar text fits perfectly on every mobile screen size (from 320px compact devices like iPhone SE up to large pro phones) without wrapping, overlapping, or clipping.

---

## [0.65.0] - 2026-08-05

### 📱 Mobile UI Overhaul & Closed Slot View Privacy Guard
- **Glassmorphism Mobile Bottom Navigation ([app/components/AdminSidebar.tsx](./app/components/AdminSidebar.tsx)):** Replaced the top scrolling bar with a floating glassmorphic bottom navigation bar (`backdrop-blur-2xl bg-[#0f121d]/75`) with active Electric Indigo glowing tabs (`#6366f1`), touch-friendly targets, and a clean top branding header.
- **Admin Layout Mobile Padding ([app/admin/layout.tsx](./app/admin/layout.tsx)):** Added `pb-28 md:pb-8` bottom padding to main admin container to ensure zero content overlap with the bottom navigation bar.
- **Mobile Calendar & Modal Touch Optimization ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx), [app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Enhanced day cell heights, toolbar layout, touch targets, and bottom-sheet modal form containers (`rounded-t-2xl sm:rounded-2xl`) for mobile screens.
- **Closed Slot View Page Privacy Guard:** Restricted public view page links (`/events/[id]`) so that draft (`closed`) slot reservations do not expose public preview links, showing a locked draft indicator badge instead until published (`live`).

---

## [0.64.0] - 2026-08-05

### 🎓 College Event Slot Booking & Role Restriction
- **Superuser & Admin College Slot Booking ([app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Added support for selecting **College** as the organizing entity during slot booking, specifically designed for college-conducted events, exams, and academic schedules.
- **Strict Role Restriction:** Access to select **College** as an organizing entity and special categories (**Exam**, **College Schedule**) is strictly restricted to Superusers (`dev`) and Admins (`admin`). Non-admin roles (Managers and Editors) cannot select or modify College events.
- **Public Directory Exclusion ([app/community/page.tsx](./app/community/page.tsx)):** Filtered out the **College** institutional entity from the public `/community` student organization directory listing so it is not displayed as a student club.
- **Calendar Visualization & Fallback Swatch ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Configured Ocean Royal Blue (`#0ea5e9`) signature color swatch for College events with high-contrast text rendering across Month, Week, Day, and Grid calendar views.
- **Database Seeding SQL:** Added Supabase SQL seeding command to initialize the system **College** community record.

---

## [0.63.0] - 2026-08-04

### 🏷️ Platform Rebranding to CEV EVENTS
- **Official Platform Rebranding:** Updated project platform branding from legacy name (`Whats @CEV`) to **CEV EVENTS** across all UI headers, Navbar, Footer, Admin Sidebar, API headers, metadata, and documentation.

---

## [0.62.0] - 2026-08-04

### 💖 Developer Credits Footer & Sponsor Button
- **Global Developer Credits Footer ([app/components/Footer.tsx](./app/components/Footer.tsx)):** Created a global dark brutalist footer with developer credits for **Shibili Aman TK**, featuring verified link badges:
  - 🐙 **GitHub:** [github.com/LordSA](https://github.com/LordSA)
  - 💼 **LinkedIn:** [linkedin.com/in/shibili-aman-tk](https://linkedin.com/in/shibili-aman-tk)
  - 🌐 **Portfolio:** [shibili.tech](https://www.shibili.tech)
  - 📧 **Email:** [shibiliamantk@gmail.com](mailto:shibiliamantk@gmail.com)
- **Interactive "Buy Me a Coffee" Sponsor Button:** Added UPI deep-link button (`upi://pay?pa=shibiliamantk@oksbi&pn=Shibili%20Aman&tn=Buy%20Me%20a%20Coffee&cu=INR`) with an interactive UPI ID copy utility and Pay App direct launcher.
- **Conditional Footer Provider ([app/components/ConFooter.tsx](./app/components/ConFooter.tsx)):** Renders the Footer globally across public pages while hiding on `/admin` and `/login` routes.

---

## [0.61.0] - 2026-08-03

### 🧹 Source Code Comment Cleanup
- **Production Code Standard Enforcement:** Systematically removed all inline comments, block explanations, notes, and commented code blocks across all `.ts`, `.tsx`, `.js`, and `.css` source files in accordance with workspace standards. Markdown documentation (`.md`) was preserved.

---

## [0.60.0] - 2026-08-03

### 💡 Dynamic Luminance Text Contrast for Community Colors
- **Perceived Luminance Algorithm ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Implemented `isDarkColor` and `getReadableTextColor` algorithms based on W3C perceived relative luminance standards (`0.299*R + 0.587*G + 0.114*B`).
  - When a community's brand color is dark (e.g. dark blue, indigo, deep purple), community name text automatically renders in crisp bright white (`#f8fafc`).
  - Ensures 100% legibility across all calendar slot views regardless of how dark or vibrant the community's chosen hex color is.

---

## [0.59.0] - 2026-08-03

### 🎨 Community Brand Color Selector & Dynamic Calendar Slot Rendering
- **Community Custom Color Selector ([app/admin/communities/page.tsx](./app/admin/communities/page.tsx)):** Added custom brand color selection to Create and Edit Community forms, featuring preset swatches (Indigo, Blue, Emerald, Pink, Amber, Purple, Red, Teal, Cyan, Orange), HTML color picker (`<input type="color">`), and hex input field.
- **Calendar Event Community Color Integration ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Integrated community signature colors into Google Calendar views (Month, Week, Day, and Grid view modes) with dynamic background fill, border accent, and bullet dot indicators matching each community's color branding.
- **Realtime Query Join Update ([lib/hooks/useRealtimeEvents.ts](./lib/hooks/useRealtimeEvents.ts)):** Updated Supabase select query to fetch `community:communities(id, name, slug, color)` and map `community_color` onto event objects.

---

## [0.58.0] - 2026-08-03

### 🛡️ Dev / Superuser RBAC Protection
- **User Management Page Protection ([app/admin/users/page.tsx](./app/admin/users/page.tsx)):** Enforced strict role isolation for Dev (Superuser) accounts.
  - Hidden `dev` role options and profiles from `admin` and `manager` roles.
  - Prevented non-dev users from modifying, adding, or deleting `dev` accounts.
- **Backend API RBAC Enforcement ([app/api/admin/users/route.ts](./app/api/admin/users/route.ts)):** Added server-side authorization validation blocking non-dev users from creating, modifying, or deleting `dev` accounts.

---

## [0.57.0] - 2026-08-03

### ➖ Connected Horizontal Multi-Day Calendar Banner & Gap Fix
- **Google Calendar Multi-Day Banner Alignment ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Eliminated horizontal gaps and container clipping on multi-day event bars in Month view.
  - Refactored day cell layout with `px-0` container padding.
  - Applied boundary-aligned classes (`ml-1 mr-0` on start day, `mx-0` on middle days, `mr-1 ml-0` on end day), allowing multi-day event bars to span 100% continuously across calendar columns as a single unified line without gaps or overflow clipping.

---

## [0.56.0] - 2026-08-03

### 📆 Multi-Day Event Calendar Range Rendering Fix
- **Multi-Day Date Range Evaluation ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Refactored `isEventOnDate` matcher function to parse start and end ISO date boundaries from multi-day event date range strings (`YYYY-MM-DD to YYYY-MM-DD`, `YYYY-MM-DD - YYYY-MM-DD`, `YYYY-MM-DD / YYYY-MM-DD`), ensuring multi-day events render continuously across all dates in their scheduled range.
- **Supabase Multi-Day Date Hydration ([lib/hooks/useRealtimeEvents.ts](./lib/hooks/useRealtimeEvents.ts)):** Hydrated full multi-day date range strings from event system prompts (`- Date: YYYY-MM-DD to YYYY-MM-DD`) during realtime query sync.

---

## [0.55.0] - 2026-08-03

### 🧱 Standalone Admin Sidebar Component & Calendar Size Optimization
- **Standalone Admin Sidebar ([app/components/AdminSidebar.tsx](./app/components/AdminSidebar.tsx)):** Extracted admin sidebar navigation into a dedicated component with viewport sticky positioning (`sticky top-0 h-screen`), isolating its width and height from any page content length or scroll behavior.
- **Admin Layout Refactoring ([app/admin/layout.tsx](./app/admin/layout.tsx)):** Refactored layout shell to invoke `<AdminSidebar />` with `min-w-0` content container.
- **Compact Calendar Sizing ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Reduced calendar container min-heights (`min-h-[500px]`), cell heights (`min-h-[90px]`), and hour slot heights (`min-h-[52px]`) for a sleeker, well-proportioned view.

---

## [0.54.0] - 2026-08-03

### 📅 Admin Google Calendar Event Slot View Upgrade
- **Admin Slot Booking Page ([app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Transformed admin event slot management page into a Google Calendar slot view.
- **Interactive Google Calendar Component ([app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx)):** Upgraded `GoogleCalendarView` with Admin Slot Booking capabilities:
  - Supports **Month**, **Week**, **Day**, and **Grid/List** view modes.
  - Interactive Date Cell Selection: Clicking empty date/time cells in Month, Week, or Day views pre-selects start/end dates and times in the slot booking modal.
  - Visual Status Badging: Amber `Closed (Draft Slot)` badges and Emerald `Live (Published)` badges.
  - Quick Slot Action Popovers: 1-click status toggles, inline slot editing, slot deletion (with RBAC enforcement), and public page links.
- **Documentation & Zero Comments Enforcement:** Updated all project documentation and maintained 100% clean production code with zero temporary comments.

---

## [0.53.0] - 2026-08-01

### 🎨 Main Event Directory Theme & Card Redirection Upgrade
- **Main Event Directory ([app/events/page.tsx](./app/events/page.tsx)):** Upgraded page layout to match the active dark brutalist theme (`#08090d`, `#0f121d`, `#161a29`, `#1e2436`, `#6366f1`).
- **Master Calendar Design & Redirection ([app/components/MasterCalendar.tsx](./app/components/MasterCalendar.tsx)):** Replaced generic neutral cards with full brutalist card components (`brutalist-card`, `hover:border-[#6366f1]`), added full-card link redirection to `/events/${evt.slug || evt.id}`, and enabled clickable community name subpage links (`/community/${evt.community_slug || evt.community_id}`).

---

## [0.52.0] - 2026-08-01

### ↩️ History Stack Navigation Proxy & Left-Aligned Back Button Fix
- **Unrestricted `router.back()` History Proxy ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx), [app/community/[id]/page.tsx](./app/community/[id]/page.tsx)):** Removed strict `document.referrer` checks so client-side SPA transitions seamlessly execute `router.back()` to return users directly to their exact originating page (Home, Community Showcase, Events Directory, or Calendar).
- **Left-Aligned Back Button ([app/community/[id]/page.tsx](./app/community/[id]/page.tsx)):** Moved the `"Back"` button to the top left of the layout container (`max-w-6xl mx-auto`), matching the exact position, styling, and brutalist card design system of event detail pages.

---

## [0.51.0] - 2026-08-01

### ⬅️ Simplified "Back" Navigation Button & Referrer Redirection
- **Standardized "Back" Label ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx), [app/community/[id]/page.tsx](./app/community/[id]/page.tsx)):** Simplified the navigation button text on all event and community slug pages to purely `"Back"`.
- **Referrer Redirection (`router.back()`):** Configured click handlers on both detail pages to execute `router.back()` if internal history exists, returning users directly to whatever page they originated from.

---

## [0.50.0] - 2026-08-01

### 🖼️ Community Page Subpage Link Fix & Logo Header Integration
- **Community Directory Page ([app/community/page.tsx](./app/community/page.tsx)):** Updated community cards to redirect directly to their community showcase subpages (`/community/${comm.slug || comm.id}`) instead of redirecting to the filtered event directory.
- **Showcase Header Logo ([app/community/[id]/page.tsx](./app/community/[id]/page.tsx)):** Rendered official community logo images (`community.logo_url`) in the community subpage header with fallback to gradient initial badges.

---

## [0.49.0] - 2026-08-01

### 🔗 Full Home Page Card Redirection & Community Subpage Badges
- **Full Event Card Navigation ([app/page.tsx](./app/page.tsx)):** Wrapped the entire featured event cards on the home page in full `<Link>` components, matching the interaction pattern of community showcase pages.
- **Clickable Community Badges:** Clicking the community name on any event card on the home page now redirects straight to `/community/${community_slug || community_id}`.

---

## [0.48.0] - 2026-08-01

### 🔗 Community Card Redirection & Smart Back Button Navigation
- **Home Page Community Redirection ([app/page.tsx](./app/page.tsx)):** Wrapped home page community cards with `<Link href={`/community/${c.slug || c.id}`}>` to enable direct navigation to community subpages.
- **Smart Referrer Back Button ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):** Implemented referrer-aware back button navigation. Dynamically updates label (`Back to Home`, `Back to Community`, `Back to All Events`) and executes `router.back()` to return users directly to the originating page.
- **Isolated Community Slug Lookup ([app/community/[id]/page.tsx](./app/community/[id]/page.tsx)):** Separated UUID vs non-UUID slug queries to prevent Postgres type casting crashes when querying community subpages by slug.

---

## [0.47.0] - 2026-07-31

### 💬 AI Assistant Markdown Bold Renderer
- **Bold Element Renderer ([app/components/EventAiDrawer.tsx](./app/components/EventAiDrawer.tsx)):** Added `renderFormattedMessage` helper to parse markdown bold syntax (`**text**`) and convert it into styled `<strong>` elements instead of rendering literal asterisks in chat bubbles.

---

## [0.46.0] - 2026-07-31

### 🛠️ Description Parser Algorithm Upgrade
- **Robust Text Splitting ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):** Fixed regex parsing bug where description text without trailing period punctuation or with markdown formatting failed to return. Implemented lookbehind splitting (`/(?<=[.!?])\s+|\n+/`), markdown tag cleaning (`**`, `#`), and guaranteed 3-sentence sentence/paragraph extraction for all input text types.

---

## [0.45.0] - 2026-07-31

### 📝 3-Line Description Overview & Assistant Bar Refactor
- **Description Refactor ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):** Refactored the event description overview to display exactly 3 concise sentences with `line-clamp-3`, directly followed by the interactive "Need full guidelines, timeline, or FAQs? Ask Assistant" drawer prompt bar.

---

## [0.44.0] - 2026-07-31

### 🛠️ Postgres UUID Syntax Error Fix on Slug Routing
- **Isolated Slug & UUID Queries ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):** Resolved `invalid input syntax for type uuid: "test"` error by separating UUID vs non-UUID string query paths. For non-UUID slugs (such as `test` or `codesprint-2026`), queries search `.eq('slug', eventId)` and `.ilike('title', eventId)` without triggering Postgres type casting exceptions.

---

## [0.43.0] - 2026-07-31

### 🔗 Main Landing Page & Community Detail Page Slug Routing
- **Main Home Page ([app/page.tsx](./app/page.tsx)):** Updated live events list cards to navigate to `/events/${evt.slug || evt.id}` instead of raw UUID primary keys.
- **Community Page ([app/community/[id]/page.tsx](./app/community/[id]/page.tsx)):** Updated community event cards to navigate using `event.slug || event.id`.

---

## [0.42.0] - 2026-07-31

### 📐 3:4 Poster Frame Aspect Ratio & Title-Based Slug Routing
- **3:4 Frame Aspect Ratio ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):** Updated the event detail poster container to use `aspect-[3/4]` (1080x1440 portrait aspect ratio).
- **Title-Based Slug Routing:**
  - `generateSlug` helper converts event titles into URL slugs (`codesprint-2026`).
  - Saved `slug` in Supabase `events` table during creation and updates.
  - Detail page lookup searches `slug` first, with fallback to `id`.
  - All navigation links across `MasterCalendar`, `GoogleCalendarView`, and directory cards now navigate to `/events/${evt.slug || evt.id}`.

---

## [0.41.0] - 2026-07-31

### 🛠️ Supabase Schema Cache Missing Column Retry Fix
- **Adaptive Payload Retry ([app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Resolved `Could not find the 'perks' column of 'events' in the schema cache` error by removing un-cached optional fields and automatically retrying database inserts/updates. Ensures `poster_url`, `venue`, and all core event details save reliably to Supabase.

---

## [0.40.0] - 2026-07-31

### 🖼️ Default Poster Image Fallback & Supabase Error Handling
- **Default Poster Image ([public/images/poster.webp](./public/images/poster.webp)):** Generated high-resolution default WebP campus event poster image at `./public/images/poster.webp`.
- **Pure Poster Renderer ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):** Updated detail page to render purely the poster image, falling back to `/images/poster.webp` when unassigned or on load failure.
- **Supabase Insert & Update Verification ([app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Added explicit Supabase error verification (`if (insertErr) throw new Error(insertErr.message)`) to ensure uploaded Blob URLs save to the database and map inserted row IDs to local state.

---

## [0.39.0] - 2026-07-31

### 🎨 Non-Repetitive Campus Media Artwork Card
- **Sleek Fallback Redesign ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):** Replaced the redundant text fallback card (which duplicated title, category, community, date, and venue) with a sleek, non-repetitive Campus Media Artwork Card. Features a "CEV Verified Event" seal, pulse emblem, and direct Assistant action prompt when custom posters are unassigned.

---

## [0.38.0] - 2026-07-31

### 🔍 Dynamic Event Fetching & Multi-Property Poster Image Resolution
- **ID & Slug Resolution ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):** Updated Supabase query logic to handle both UUID primary keys (`id`) and custom URL slugs (`slug`) dynamically using `maybeSingle()`.
- **Multi-Property Poster Fallback:** Checks `eventData.poster_url`, `eventData.image`, and `eventData.image_url` properties to guarantee poster resolution across legacy and newly created events. Resets `imgError` state on route updates.

---

## [0.37.0] - 2026-07-31

### 🖼️ Poster Fallback Card & Admin Live Preview Component
- **Poster Fallback UI ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):** Replaced 404 image errors and blank black boxes with an intelligent poster fallback card. When no poster is uploaded or an image fails to load, a stylized gradient poster card renders with category badge, title, community name, date, and venue details.
- **Admin Modal Poster Preview ([app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Added live poster preview thumbnail box in the event creation/edit modal so organizers can verify uploaded Vercel Blob images or pasted URLs in real time.

---

## [0.36.0] - 2026-07-31

### 🖼️ Event Poster URL DB Fetching & Realtime Sync Fix
- **Realtime Events Hook Mapping ([lib/hooks/useRealtimeEvents.ts](./lib/hooks/useRealtimeEvents.ts)):** Mapped `poster_url`, `venue`, `perks`, and `system_prompt` fields directly from Supabase query results into the `EventItemData` objects.
- **Admin Event Update Fix ([app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Added explicit `poster_url` and `image` properties to `updatedEvt` state during event modifications, ensuring poster URLs save to Supabase and render immediately without requiring page refresh.

---

## [0.35.0] - 2026-07-31

### 🤖 Intelligent AI Response Sanitization & Offline Fallback Parser
- **AI Prompt Leak Prevention ([app/api/chat/route.ts](./app/api/chat/route.ts)):** Fixed offline and online fallback handlers to extract clean structured fields (Name, Date, Time, Venue, Category, Perks) and generate natural peer answers without ever printing internal system prompts or developer preambles (`You are the official AI Assistant...`).
- **System Instruction Isolation:** Passed system prompt as `systemInstruction` in Gemini and structured `system` messages in Grok/OpenRouter to isolate prompt rules from user message streams.

---

## [0.34.0] - 2026-07-31

### 🧹 Project-Wide Code Cleanup & Comment Removal
- **Global Comment Removal ([app/](./app), [lib/](./lib)):** Inspected every page, component, and utility module ([app/admin/events/page.tsx](./app/admin/events/page.tsx), [app/events/[id]/page.tsx](./app/events/[id]/page.tsx), [app/components/EventAiDrawer.tsx](./app/components/EventAiDrawer.tsx), [app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx), [app/components/MasterCalendar.tsx](./app/components/MasterCalendar.tsx), [lib/summary.ts](./lib/summary.ts), [lib/upload.ts](./lib/upload.ts)) and stripped all code comments, delivering 100% clean, production-ready code.

---

## [0.33.0] - 2026-07-31

### 🧹 Code Cleanup & Landing Page Refactor
- **Landing Page Clean Code ([app/page.tsx](./app/page.tsx)):** Stripped all code comments and section notes, delivering clean, production-ready source code.

---

## [0.32.0] - 2026-07-31

### ⏰ HTML5 Time Input 24-Hr Converter (`parseTimeTo24Hr`)
- **HTML5 Time Input Parsing Fix ([app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Added `parseTimeTo24Hr()` helper function to convert stored 12-hour database strings (e.g. `01:00 PM - 04:00 PM`) into strict 24-hour `HH:mm` format (`13:00` / `16:00`), resolving the blank input box bug when opening event edit modals.

---

## [0.31.0] - 2026-07-31

### 📐 Spacious Admin Booking Modal & Mouse Scroll Fix
- **Modal Width Expansion ([app/admin/events/page.tsx](./app/admin/events/page.tsx)):** Expanded event booking modal width from `max-w-xl` (576px) to a spacious `max-w-3xl` (768px) with an organized 2-column grid layout for form inputs.
- **Lenis Scroll Interception Fix:** Added `data-lenis-prevent` and `max-h-[88vh] overflow-y-auto` to both backdrop and modal container, restoring native mouse wheel and trackpad scrolling inside Lenis smooth scroll overlays.

---

## [0.30.0] - 2026-07-31

### 📍 Venue Field & Non-Freezing Submit Logic
- **Venue Database Column:** Added `venue` input field for admins when creating or modifying event slots, defaulting to `Campus Setup / CEV`.
- **Non-Freezing Submit Logic:** Added `submitting` state and `try/catch/finally` blocks to eliminate form freezing during event creation/edits.

---

## [0.29.0] - 2026-07-31

### ⚡ Fast AI Assistant Engine & Z-Index Layering
- **Ultra-Fast Model Upgrade ([app/api/chat/route.ts](./app/api/chat/route.ts)):** Upgraded AI chat endpoint to `gemini-1.5-flash` with `maxOutputTokens: 250` and 4-second `AbortController` timeouts for sub-500ms response times.
- **Drawer Z-Index & Body Scroll Lock ([app/components/EventAiDrawer.tsx](./app/components/EventAiDrawer.tsx)):** Escalated AI assistant drawer z-index to `z-[200]` with `document.body.style.overflow = 'hidden'` to prevent navbar overlap (`z-[100]`) or scroll sticking.

---

## [0.28.0] - 2026-07-31

### 📄 4-5 Line Event Summary & Optional Perks
- **Public Description Parser ([app/events/[id]/page.tsx](./app/events/[id]/page.tsx)):** Refactored public description parser to present a clean 4-5 line overview, stripping raw prompt preambles and appending an interactive "Ask Assistant" callout box.
- **Optional Perks Rendering:** Rendered highlights/perks badge ONLY if explicitly populated by admin roles, hiding container completely when null/blank.

---

## [0.27.0] - 2026-07-30

### ☁️ Vercel Blob Storage Integration
- **Direct WebP Upload Pipeline ([lib/upload.ts](./lib/upload.ts) & [app/api/upload/route.ts](./app/api/upload/route.ts)):** Implemented client-side WebP auto-conversion and `@vercel/blob` storage uploads for posters, logos, and avatars.
- **Next Config Remote Patterns:** Configured `remotePatterns` in `next.config.ts` for `*.public.blob.vercel-storage.com` to support Next.js `Image` optimization.

---

## [0.26.0] - 2026-07-30

### 🔒 Role-Based Access Control (RBAC) & User Management API
- **User Management Console ([app/admin/users/page.tsx](./app/admin/users/page.tsx)):** Built admin user management interface allowing Super Admins (`dev`/`admin`) and Managers (`manager`) to manage community leads and team members.
- **Admin User API ([app/api/admin/users/route.ts](./app/api/admin/users/route.ts)):** Created backend API using `SUPABASE_SERVICE_ROLE_KEY` to update both `auth.users` AND public `profiles` table seamlessly.

---

## [0.25.0] - 2026-07-29

### 🛡️ Next.js 16 Proxy Convention Migration
- **Middleware to Proxy Migration ([proxy.ts](./proxy.ts)):** Renamed `middleware.ts` to `proxy.ts` following Next.js 16 conventions to eliminate deprecation warnings.

---

## [0.24.0] - 2026-07-29

### 🎨 Local Font Engine & Dark Obsidian Design System
- **Local Font Optimization (`next/font/local`):** Preloaded local fonts `Quera`, `Gued`, and `Rondured`, completely removing Inter font dependencies.
- **Dark Obsidian Theme:** Standardized color tokens (`#08090d`, `#0f121d`, `#161a29`, `#1e2436`, `#6366f1`).

---

## [0.10.0] - 2026-07-28

### 🔐 Dual Login Engine & Supabase Auth
- **OTP & Password Auth ([app/login/page.tsx](./app/login/page.tsx)):** Implemented dual login options supporting 6-Digit Email OTP verification and traditional password authentication.

---

## [0.1.0] - 2026-07-27

### 🎉 Initial Repository Release
- **Project Setup:** Initialized Next.js App Router project with Supabase client configuration, master event list layout, and community directory foundation.
