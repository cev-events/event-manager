// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, ArrowRight } from "lucide-react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Session } from "@supabase/supabase-js"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [isOverHero, setIsOverHero] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);

      // Check if scroll position is within the dark hero section (applies to homepage)
      if (pathname === '/') {
        const heroEl = document.getElementById('hero-section');
        if (heroEl) {
          const heroHeight = heroEl.offsetHeight;
          setIsOverHero(y < heroHeight - 100);
        } else {
          setIsOverHero(y < 700);
        }
      } else {
        setIsOverHero(false); // Subpages default to light background mode
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    const supabase = createClient();
    const getSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navLinks = [
    { name: "Events", href: "/events" },
    { name: "Calendar", href: "/calendar" },
    { name: "Communities", href: "/community" },
    { name: "Support", href: "/support" },
  ]

  const isTop = scrollY < 40;

  // Determine logo source: white logo on dark hero, black logo (/cev_logo_b.svg) on light page content
  const logoSrc = isOverHero ? "/cev_logo.svg" : "/cev_logo_b.svg";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ease-out pointer-events-none ${
        isTop && isOverHero
          ? "px-8 sm:px-14 py-7 sm:py-9"
          : "px-6 sm:px-12 py-4 sm:py-5"
      }`}
    >
      <div className="w-full mx-auto flex items-center justify-between pointer-events-auto">
        
        {/* Brand Logo Only (Nixtio Style: Standalone Logo Icon, NO Background Circle Box) */}
        <Link
          href="/"
          className="flex items-center justify-center transition-transform hover:scale-105 group"
          aria-label="CEV EVENTS Home"
        >
          <img
            src={logoSrc}
            alt="CEV Logo"
            className="h-7 w-auto object-contain transition-all duration-300"
          />
        </Link>

        {/* Center Floating Nav Pill with 3 Nixtio Modes */}
        <nav
          className={`hidden md:flex items-center space-x-2 transition-all duration-500 ease-out ${
            isTop && isOverHero
              ? "bg-transparent text-white border-0 px-0 py-0"
              : "bg-white text-black border border-neutral-200/90 rounded-full px-6 py-2 shadow-2xl backdrop-blur-md transform scale-95"
          }`}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            if (isTop && isOverHero) {
              // Mode 1: Transparent spaced-out links over top dark hero
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive ? "text-white font-extrabold" : "text-white/90 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            }

            // Mode 2 & Mode 3: White floating pill box with dark typography
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                  isActive
                    ? "text-white bg-black font-extrabold shadow-sm"
                    : "text-neutral-800 hover:text-black hover:bg-neutral-100"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Button (3 Nixtio Modes) & Mobile Toggle */}
        <div className="flex items-center space-x-3">
          {!loading && (
            <Link
              href={session ? "/admin" : "/login"}
              className={`px-6 py-2.5 text-xs font-extrabold rounded-full transition-all duration-500 ease-out flex items-center gap-1.5 shadow-md ${
                isOverHero
                  ? "bg-white text-black hover:bg-neutral-200" // Modes 1 & 2 over dark hero: White button
                  : "bg-black text-white hover:bg-neutral-800" // Mode 3 over light page: Black button
              }`}
            >
              <span>{session ? "Dashboard" : "Login"}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isOverHero ? "text-black" : "text-neutral-300"}`} />
            </Link>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1 rounded-full border shadow-md transition-colors ${
              isOverHero
                ? "bg-black border-neutral-800 text-white"
                : "bg-white border-neutral-300 text-black"
            }`}
            aria-label="Toggle Menu"
          >
            <div className={`w-4 h-0.5 transition-all ${isOverHero ? "bg-white" : "bg-black"} ${isOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <div className={`w-4 h-0.5 transition-all ${isOverHero ? "bg-white" : "bg-black"} ${isOpen ? "opacity-0" : ""}`} />
            <div className={`w-4 h-0.5 transition-all ${isOverHero ? "bg-white" : "bg-black"} ${isOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-[#0a0a0a] text-white z-[110] transition-all duration-300 flex flex-col justify-between p-8 pointer-events-auto ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
          <div className="flex items-center space-x-2">
            <img src="/cev_logo.svg" alt="CEV Logo" className="h-7 w-auto object-contain" />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col space-y-6 my-auto">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-3xl font-extrabold text-white font-display hover:text-neutral-400 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="pt-6 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>CE Vadakara</span>
          <span>Official Event System</span>
        </div>
      </div>
    </header>
  )
}