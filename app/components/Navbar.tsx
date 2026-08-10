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
  const pathname = usePathname()

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

  return (
    <header className="fixed top-4 inset-x-0 z-[100] px-4">
      <div className="max-w-5xl mx-auto bg-[#0a0a0a]/90 backdrop-blur-xl border border-neutral-800 rounded-full px-6 py-3 shadow-2xl flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <img src="/cev_logo.svg" alt="CEV EVENTS" className="h-7 w-auto object-contain transition-transform group-hover:scale-105" />
          <span className="font-extrabold text-white text-base tracking-tight font-display">
            CEV<span className="text-neutral-400 font-light">EVENTS</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                  isActive ? "text-white bg-neutral-800" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button & Mobile Toggle */}
        <div className="flex items-center space-x-3">
          {!loading && (
            <Link
              href={session ? "/admin" : "/login"}
              className="px-5 py-2 text-xs font-bold text-[#0a0a0a] bg-white hover:bg-neutral-200 rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-sm"
            >
              <span>{session ? "Dashboard" : "Login"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1 rounded-full bg-neutral-900 border border-neutral-800 text-white"
            aria-label="Toggle Menu"
          >
            <div className={`w-4 h-0.5 bg-white transition-all ${isOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <div className={`w-4 h-0.5 bg-white transition-all ${isOpen ? "opacity-0" : ""}`} />
            <div className={`w-4 h-0.5 bg-white transition-all ${isOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-[#0a0a0a] text-white z-[110] transition-all duration-300 flex flex-col justify-between p-8 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
          <div className="flex items-center space-x-2">
            <img src="/cev_logo.svg" alt="CEV EVENTS" className="h-7 w-auto object-contain" />
            <span className="font-extrabold text-white text-base tracking-tight font-display">CEV EVENTS</span>
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