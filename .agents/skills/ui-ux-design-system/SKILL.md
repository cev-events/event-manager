---
name: ui-ux-design-system
description: Nixtio-inspired premium digital agency UI design system specification for CEV EVENTS. Features Swiss editorial minimalism, oversized display typography, restrained monochrome palette with project visual highlights, numbered section architecture (001, 002, 003), compact navigation with cev_logo.svg, case-study-first event storytelling, and global loading screen interactions.
---

# Nixtio-Inspired Premium Editorial UI Design System

This skill defines the authoritative design system standards for **CEV EVENTS**, based on the Nixtio premium creative digital agency design logic.

---

## 1. Design DNA & Core Aesthetics

* **Swiss & Editorial Minimalism:** High-contrast typography, large negative space, clean geometric construction, and asymmetric layout balance.
* **Monochrome Canvas:**
  - `bg-[#08090d]` (Deep Obsidian Background)
  - `bg-[#0f121d]` (Elevated Editorial Card & Panel Surface)
  - `bg-[#161a29]` (Inner Container & Input Field Surface)
  - `border-[#1e2436]` (1px/2px Structural Divider)
  - `text-[#f8fafc]` (High-contrast Slate White Headline Copy)
  - `text-[#94a3b8]` (Subdued Metadata Copy)
  - `text-[#6366f1]` (Electric Indigo Signature Accent)
* **Gallery-Like Work Presentation:** Client/Community posters and event artwork provide vibrant visual color moments against the calm monochrome interface.

---

## 2. Typography & Editorial Hierarchy

* **Display Headlines (`font-display`):** `Quera` (`--font-quera`). Tight line-height (0.85–1.05), tight tracking (`-0.03em`), 700–900 font weight.
* **Section Headings (`font-heading`):** `Gued` (`--font-gued`). Used for card titles, section headers, and modal titles.
* **Body & UI Copy (`font-sans`):** `Rondured` (`--font-roundered`). Used for descriptions, inputs, buttons, and metadata labels.
* **Numbered Section Architecture:** Major sections use 3-digit numbered markers (`001`, `002`, `003`) as bold graphic elements preceding section titles.

---

## 3. Global Logo & Brand Identity

* **Official Logo Asset:** [`public/cev_logo.svg`](file:///c:/Users/shibi/Desktop/Work/event-m/event-manager/public/cev_logo.svg) is used exclusively across all headers, footers, sidebars, login cards, favicon metadata, and loading screens.

---

## 4. Global Loading Screen & Motion Interactions

* **Component:** `app/components/LoadingScreen.tsx`
* **Features:** Full-screen overlay with animated `cev_logo.svg`, live percentage counter (`0% -> 100%`), sleek progress bar indicator, and smooth fade-out animation.

---

## 5. Strict Clean Code & Backend Contract Preservation

* **Zero Inline Temporary Comments:** All source files must maintain clean, production-ready code without temporary comment indicators.
* **Preserve All Backend Contracts:** Supabase queries, API routes, RBAC permissions, slot privacy shields, multi-day calendar logic, and form submit handlers MUST remain fully functional.
