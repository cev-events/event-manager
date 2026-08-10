// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { X, ArrowRight, Shield, Calendar } from "lucide-react"
import { usePathname } from "next/navigation"
import gsap from "gsap"
import { createClient } from "@/lib/supabase/client"
import { Session } from "@supabase/supabase-js"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".nav-item", {
        y: -10,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.1
      })

      gsap.from(".nav-logo", {
        x: -10,
        opacity: 0,
        duration: 1,
        ease: "power4.out"
      })
    })
    return () => ctx.revert()
  }, [])

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Communities", href: "/community" },
  ]

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ease-in-out ${scrolled ? "py-3 px-4 md:px-10" : "py-6 px-4 md:px-10"
        }`}
    >
      <div
        className={`max-w-7xl mx-auto transition-all duration-500 ease-in-out rounded-[2rem] ${scrolled
            ? "bg-[#0f121d]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-[#1e2436] px-6"
            : "bg-transparent px-0"
          }`}
      >
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="nav-logo flex items-center group space-x-2.5 shrink-0">
            <img src="/cev_logo.svg" alt="CEV EVENTS" className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="font-bold text-white tracking-tight text-base sm:text-lg font-display group-hover:text-[#6366f1] transition-colors">
              CEV <span className="text-[#6366f1]">EVENTS</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`nav-item relative px-5 py-2 text-xs font-semibold tracking-wider uppercase transition-colors duration-300 group ${pathname === link.href ? "text-[#6366f1]" : "text-[#94a3b8] hover:text-white"
                  }`}
              >
                <span className="relative z-10">{link.name}</span>

                {pathname === link.href && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#6366f1] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.9)]" />
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/15 to-[#6366f1]/25 rounded-full opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out -z-0 border border-[#6366f1]/30" />
              </Link>
            ))}

            {!loading && (
              <div className="nav-item pl-4 flex items-center">
                <Link
                  href={session ? "/admin" : "/calendar"}
                  className="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-semibold text-white rounded-full bg-gradient-to-br from-[#6366f1] to-[#4f46e5] shadow-md hover:shadow-[0_10px_25px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#818cf8] to-[#6366f1] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-full pointer-events-none" />

                  <span className="relative flex items-center gap-2 text-xs tracking-widest uppercase z-10 font-bold">
                    {session ? "Dashboard" : "Calendar"}{" "}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="nav-item md:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5 rounded-full hover:bg-[#161a29] border border-transparent hover:border-[#1e2436] transition-colors group"
            aria-label="Toggle Navigation Menu"
          >
            <div className={`w-5 h-0.5 bg-white transition-all duration-500 ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
            <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${isOpen ? "opacity-0" : ""}`} />
            <div className={`w-5 h-0.5 bg-white transition-all duration-500 ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-[#08090d]/95 backdrop-blur-2xl text-white z-[110] transition-all duration-500 ease-[0.85,0,0.15,1] overflow-y-auto ${isOpen ? "translate-y-0 pointer-events-auto opacity-100" : "-translate-y-full pointer-events-none opacity-0"
          }`}
      >
        <div className="min-h-full flex flex-col justify-between py-20 px-8 md:px-20 relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 md:w-16 md:h-16 border border-[#1e2436] rounded-full flex items-center justify-center hover:bg-[#161a29] transition-colors"
            aria-label="Close Menu"
          >
            <X className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </button>

          <div className="space-y-10 mt-10 md:mt-0">
            <p className="text-[#6366f1] text-xs md:text-sm font-bold tracking-[0.3em] uppercase">Navigation</p>
            <div className="flex flex-col space-y-6 md:space-y-4">
              {navLinks.map((link, i) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="group flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-[#94a3b8] text-base md:text-2xl font-light mr-4 md:mr-6 font-mono">0{i + 1}</span>
                  <span className="text-4xl md:text-6xl font-bold tracking-tight hover:text-[#6366f1] transform group-hover:translate-x-4 transition-all duration-300 font-display">
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-16 md:mt-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-10 pb-10 border-t border-[#1e2436] pt-10">
            {/* <div className="space-y-4">
              <p className="text-[#94a3b8] text-[10px] md:text-xs font-bold tracking-widest uppercase text-left">Connectivity</p>
              <div className="flex gap-8 text-base md:text-xl font-medium">
                <a href="https://instagram.com/iedc_cev" target="_blank" rel="noopener noreferrer" className="hover:text-[#6366f1] transition-colors">Instagram</a>
                <a href="https://linkedin.com/company/iedc-cev" target="_blank" rel="noopener noreferrer" className="hover:text-[#6366f1] transition-colors">LinkedIn</a>
              </div>
            </div> */}

            <Link
              href={session ? "/admin" : "/calendar"}
              onClick={() => setIsOpen(false)}
              className="group flex flex-col text-left"
            >
              <p className="text-[#94a3b8] text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2">CEV Event Manager</p>
              <span className="text-3xl md:text-5xl font-bold flex items-center gap-4 md:gap-6 group-hover:text-[#6366f1] transition-colors font-display">
                {session ? "Dashboard" : "Calendar"}{" "}
                <ArrowRight className="h-7 w-7 md:h-10 md:w-10 group-hover:translate-x-4 transition-transform text-[#6366f1]" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}