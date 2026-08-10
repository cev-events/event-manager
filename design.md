# Design System & Motion Specification

## 1. Overview & Aesthetics (Nixtio Editorial UI)
The design language of **CEV EVENTS** is governed by the **Nixtio-Inspired Editorial Digital Agency UI** (.agents/skills/ui-ux-design-system/SKILL.md). It combines **Swiss editorial minimalism**, **oversized display typography** (`Quera` display font with 0.85–1.05 tight line-height), **numbered section architecture** (`001`, `002`, `003`), **restrained monochrome visual canvas** (`#08090d`, `#0f121d`, `#161a29`), official logo asset ([public/cev_logo.svg](./public/cev_logo.svg)), and a global **Loading Screen** (`app/components/LoadingScreen.tsx`).

---

## 2. Color System & Palette

### Base Dark Obsidian Palette
* **Background Primary:** `#08090d` (Deep Navy Charcoal)
* **Surface Background:** `#0f121d` (Elevated Panel Dark)
* **Elevated Container:** `#161a29` (Card Surface)
* **Border Colors:** `#1e2436` (Subtle 1px/2px Border) / `#2a334c` (Strong Border)
* **Primary Accent:** `#6366f1` (Electric Indigo) with `#4f46e5` border & `#312e81` shadow
* **Secondary Accent:** `#10b981` (Vibrant Emerald)
* **Warning Accent:** `#f59e0b` (Amber Orange) for closed draft slots
* **Text Primary:** `#f8fafc` (High-contrast Slate White)
* **Text Muted:** `#94a3b8` (Slate Neutral Muted)

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

### Brutalist Cards & Containers
* Class: `.brutalist-card`
* Background: `#0f121d`
* Border: `2px solid #1e2436`
* Border Radius: `1rem` (16px / `rounded-2xl`)
* Hover State: Border transitions to `#6366f1` with subtle 2px offset box-shadow.

### Glassmorphic Mobile Bottom Navbar
* Positioning: `fixed bottom-3 left-3 right-3 z-50 md:hidden`
* Background: `#0f121d` with 75% opacity (`bg-[#0f121d]/75`)
* Backdrop Filter: `backdrop-blur-2xl`
* Border: `1px solid rgba(30, 36, 54, 0.9)` (`rounded-2xl`)
* Box Shadow: `0px 8px 32px rgba(0, 0, 0, 0.6)`
* Active Tab Glow: Electric Indigo pill (`#6366f1`) with `shadow-[0_0_12px_rgba(99,102,241,0.5)]` and scale micro-animation (`scale-105`)

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
* **Z-Index Layering:** Main Navbar (`z-[100]`), Modal Windows (`z-[150]`), AI Assistant Drawer (`z-[200]`).
* **Admin Google Calendar Slot View:** Fully interactive month/week/day/grid slot view with amber draft indicators (`#f59e0b`), emerald live badges (`#10b981`), direct cell date selection, popovers with quick status toggles, connected multi-day banners, community signature colors, W3C contrast readability, and RBAC matrix enforcement.
