# Design System & Motion Specification

## 1. Overview & Aesthetics (Nixtio Editorial UI)
The design language of **CEV EVENTS** is governed by the **Nixtio-Inspired Editorial Digital Agency UI** (.agents/skills/ui-ux-design-system/SKILL.md). It combines **Swiss editorial minimalism**, **oversized display typography** (`Quera` display font with 0.85–1.05 tight line-height), **numbered section architecture** (`001`, `002`, `003`), **restrained monochrome visual canvas** (`#08090d`, `#0f121d`, `#161a29`), official logo asset ([public/cev_logo.svg](./public/cev_logo.svg)), and a global **Loading Screen** (`app/components/LoadingScreen.tsx`).

---

## 2. Color System & Palette (Nixtio Dual Theme)

### Flux Admin Dashboard Design Tokens
* **Workspace Light Canvas:** `#edf0f4` (Light Grey Soft Slate)
* **Sidebar Dark Charcoal:** `#18191c` (Deep Charcoal Black)
* **Sidebar Border:** `#24262b` (Dark Slate Border)
* **White Card Surface:** `#ffffff` (`rounded-[28px] p-6 shadow-sm border border-neutral-200/60`)
* **Dark Feature Card Surface:** `#18191c` (`rounded-[28px] p-6 sm:p-8 shadow-xl text-white`)
* **Active Sidebar Link:** Floating White Pill (`bg-white text-[#141518] font-extrabold rounded-full px-5 py-3 shadow-lg`) with dark indicator dot (`w-2 h-2 rounded-full bg-[#141518]`).
* **Header Profile & Search Bar:** Pill-shaped white input & user card (`bg-white rounded-full px-4 py-2 text-xs font-bold shadow-sm`).

### Community Signature Color Palette (Preset Swatches)
* **IEEE Indigo:** `#6366f1` (Default)
* **College Ocean Blue:** `#0ea5e9` (Institutional Events, Exams & Schedules)
* **IEEE Blue:** `#3b82f6`
* **IEDC Emerald:** `#10b981`
* **TinkerHub Pink:** `#ec4899`
* **FOSS Amber:** `#f59e0b`
* **MuLearn Purple:** `#8b5cf6`
* **Red Accent:** `#ef4444`
* **Teal Accent:** `#14b8a6`
* **Cyan Accent:** `#06b6d4`
* **Orange Accent:** `#f97316`

### W3C Relative Luminance Contrast Standard
* **Perceived Relative Luminance Formula:** `luminance = (0.299 * R + 0.587 * G + 0.114 * B) / 255`
* **Dark Community Colors (`luminance < 0.6`):** Community name text automatically renders in crisp bright white (`#f8fafc`) for 100% legibility against dark backgrounds.
* **Light Community Colors (`luminance >= 0.6`):** Community name text renders using the vibrant community hex color.

---

## 3. Typography Hierarchy & Custom Fonts

### Font Optimization (`next/font/local`)
* **Display / Hero Headlines (`font-display`):** `Quera` (`./fonts/quera.otf`, `--font-quera`)
* **Section Headings & Titles (`font-heading`):** `Gued` (`./fonts/gued.otf`, `--font-gued`)
* **Body Copy & UI Labels (`font-sans`):** `Rondured` (`./fonts/roundered.ttf`, `--font-roundered`)
* **System Fallbacks:** `system-ui, -apple-system, sans-serif` (Inter is strictly forbidden).

---

## 4. Component Rules & Layout Specifications

### Nixtio Floating Navigation Bar (3 Transition Modes)
* **Mode 1 (Initial Top State over Dark Hero, `scrollY < 40`):** Transparent container (`bg-transparent border-transparent shadow-none`), standalone white logo (`/cev_logo.svg`), spaced-out text links (`text-white/85 hover:text-white`), and solid white CTA button (`bg-white text-black font-extrabold hover:bg-neutral-200`).
* **Mode 2 (Scrolled Over Dark Hero, `scrollY >= 40`):** Compact floating white glass pill (`bg-white/70 backdrop-blur-2xl border border-white/70 shadow-[0_8px_35px_rgba(0,0,0,0.10)] rounded-full px-2 py-1.5`), black active tab indicator (`bg-black text-white rounded-full`), white CTA button.
* **Mode 3 (Scrolled Over Light Page Content):** Standalone black logo (`/cev_logo_b.svg`), floating white glass pill center navigation, black CTA button (`bg-black text-white font-extrabold hover:bg-neutral-800`).

### Full-Screen Hero Card Scroll Shrink Animation ([app/page.tsx](./app/page.tsx))
* **Hero Container Shrink (`scrollY > 40`):** Hero width shrinks from `w-[99%]` to `w-[95%]`, height shrinks from `min-h-[99vh]` to `min-h-[75vh]`, and corner radius scales from `rounded-[1.3rem]` to `rounded-[1rem]`.
* **Timing & Cubic-Bezier Easing:** `transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]` for fluid high-end motion.
* **Title Dynamic Scaling:** Oversized display headline (`CEV EVENTS`) scales dynamically from `text-[15rem]` to `text-[10rem]` on scroll.

### Swiss Editorial Cards & Rounded Corners
* **Community Cards (`rounded-[24px]`):** White elevated card (`bg-white rounded-[24px] h-[165px]`) with logo scale on hover (`scale-105`) and `hover:scale-[1.015] hover:shadow-lg`.
* **Schedule Cards (`rounded-[24px]`):** Poster image card (`min-h-[680px] bg-white rounded-[24px]`) with dark image overlay, category/community badges, and 300ms rotating arrow button (`group-hover:rotate-[-45deg]`).
* **Community Detail Hero (`rounded-[28px]`):** White hero section (`min-h-[560px] bg-white rounded-[28px]`) with centered logo container (`w-32 h-32 rounded-[28px]`) and radial blur element.

### Global Page Entrance Motion ([app/template.tsx](./app/template.tsx))
* **Framer Motion Transition:** `initial={{ opacity: 0, y: 24, filter: 'blur(5px)' }}`, `animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}`, `transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}`.

### Brutalist Action Buttons
* Primary CTA: `.brutalist-btn-primary` (`bg-[#6366f1] text-white border border-[#4f46e5] shadow-[3px_3px_0px_0px_#312e81]`)
* Secondary CTA: `.brutalist-btn-secondary` (`bg-[#161a29] text-white border border-[#1e2436]`)

### Connected Multi-Day Calendar Banner Layout
* Day cell containers use `px-0` padding to eliminate horizontal gaps across grid columns.
* **Start Day:** `ml-1 mr-0 rounded-l-md rounded-r-none border-r-0`
* **Middle Days:** `mx-0 rounded-none border-x-0`
* **End Day:** `mr-1 ml-0 rounded-r-md rounded-l-none border-l-0`

---

## 5. Modal Window Sizing, Production Code & Clean Standards

### Clean Production Code Rules ([.agents/AGENTS.md](./.agents/AGENTS.md))
* **Zero Temporary Comments Across All Pages:** All source code files ([app/page.tsx](./app/page.tsx), [app/admin/events/page.tsx](./app/admin/events/page.tsx), [app/events/[id]/page.tsx](./app/events/[id]/page.tsx), [app/components/EventAiDrawer.tsx](./app/components/EventAiDrawer.tsx), [app/components/GoogleCalendarView.tsx](./app/components/GoogleCalendarView.tsx), [app/components/MasterCalendar.tsx](./app/components/MasterCalendar.tsx), [lib/summary.ts](./lib/summary.ts), [lib/upload.ts](./lib/upload.ts)) maintain clean, production-ready code with zero inline temporary notes or comment indicators.
* **HTML5 Time Parser (`parseTimeTo24Hr`):** Converts 12-hour database strings into 24-hour `HH:mm` format for time inputs.
* **Spacious 2-Column Layout (`max-w-3xl`):** Extended modal container width to `768px` (`max-w-3xl`) with `data-lenis-prevent` for mouse wheel scrolling inside Lenis smooth scroll overlays.
* **Z-Index Layering:** Mobile Floating Navbar (`z-40`), Main Navbar (`z-[100]`), Modal Windows (`z-50` with backdrop `z-50` and modal container `max-h-[85vh] overflow-y-auto`), AI Assistant Drawer (`z-[200]`).
* **Admin Google Calendar Slot View:** Fully interactive month/week/day/grid slot view with amber draft indicators (`#f59e0b`), emerald live badges (`#10b981`), direct cell date selection, popovers with quick status toggles, connected multi-day banners, community signature colors, W3C contrast readability, and RBAC matrix enforcement.

