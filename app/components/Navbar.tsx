"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [isOverDark, setIsOverDark] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);

      if (pathname === "/calendar") {
        setIsOverDark(true);
        return;
      }

      if (pathname === "/") {
        const hero = document.getElementById("hero-section");

        if (hero) {
          const rect = hero.getBoundingClientRect();
          const navbarPoint = 70;

          setIsOverDark(
            rect.top <= navbarPoint && rect.bottom > navbarPoint
          );
        } else {
          setIsOverDark(false);
        }

        return;
      }

      setIsOverDark(false);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const supabase = createClient();

    const getSession = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        setSession(currentSession);
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Events", href: "/events" },
    { name: "Calendar", href: "/calendar" },
    { name: "Communities", href: "/community" },
    { name: "Support", href: "/support" },
  ];

  const isInitial = scrollY < 40;
  const darkMode = isOverDark;

  const logoSrc = darkMode
    ? "/cev_logo.svg"
    : "/cev_logo_b.svg";

  return (
    <header
      className={`
        fixed top-0 inset-x-0 z-[100]
        pointer-events-none
        transition-all duration-[900ms]
        ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isInitial
          ? "px-8 sm:px-14 lg:px-16 py-7 sm:py-9"
          : "px-6 sm:px-10 lg:px-14 py-4 sm:py-5"
        }
      `}
    >
      <div className="w-full mx-auto flex items-center justify-between pointer-events-auto">

        <div className="flex-1 flex justify-start">
          <Link
            href="/"
            aria-label="CEV EVENTS Home"
            className="flex items-center transition-transform duration-500 hover:scale-105"
          >
            <img
              src={logoSrc}
              alt="CEV Logo"
              className={`
                w-auto object-contain
                transition-all duration-[900ms]
                ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isInitial
                  ? "h-9 sm:h-10 lg:h-11"
                  : "h-7 sm:h-8"
                }
              `}
            />
          </Link>
        </div>

        <nav
          className={`
            hidden md:flex
            items-center
            transition-all duration-[900ms]
            ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isInitial
              ? `
                  gap-7 lg:gap-9 xl:gap-11
                  px-0 py-0
                  bg-transparent
                  border-transparent
                  shadow-none
                  backdrop-blur-0
                `
              : `
                  gap-0.5
                  px-2 py-1.5
                  rounded-full
                  bg-white/70
                  backdrop-blur-2xl
                  backdrop-saturate-150
                  border border-white/70
                  shadow-[0_8px_35px_rgba(0,0,0,0.10)]
                `
            }
          `}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`
                  rounded-full
                  transition-all duration-[700ms]
                  ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${isInitial
                    ? `
                        px-1
                        py-2
                        text-sm lg:text-[15px]
                        font-semibold
                        ${darkMode
                      ? "text-white/85 hover:text-white"
                      : "text-black/75 hover:text-black"
                    }
                        ${isActive
                      ? darkMode
                        ? "text-white font-extrabold"
                        : "text-black font-extrabold"
                      : ""
                    }
                      `
                    : `
                        px-4 py-2
                        text-xs
                        font-bold
                        ${isActive
                      ? "bg-black text-white"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-black"
                    }
                      `
                  }
                `}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 flex justify-end items-center gap-3">
          {!loading && (
            <Link
              href={session ? "/admin" : "/login"}
              className={`
                hidden sm:flex
                items-center gap-1.5
                rounded-full
                font-extrabold
                transition-all duration-[900ms]
                ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isInitial
                  ? `
                      px-6 lg:px-7
                      py-3
                      text-xs
                      ${darkMode
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "bg-black text-white hover:bg-neutral-800"
                  }
                    `
                  : `
                      px-5
                      py-2.5
                      text-xs
                      ${darkMode
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "bg-black text-white hover:bg-neutral-800"
                  }
                    `
                }
              `}
            >
              <span>
                {session ? "Dashboard" : "Login"}
              </span>

              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            className={`
              md:hidden
              relative
              w-9 h-9
              rounded-full
              flex items-center justify-center
              border
              transition-all duration-700
              ${darkMode
                ? "bg-black border-neutral-800"
                : "bg-white border-neutral-200"
              }
            `}
          >
            <div
              className={`
                absolute w-4 h-0.5 transition-all duration-300
                ${darkMode ? "bg-white" : "bg-black"}
                ${isOpen ? "rotate-45" : "-translate-y-1.5"}
              `}
            />

            <div
              className={`
                absolute w-4 h-0.5 transition-all duration-300
                ${darkMode ? "bg-white" : "bg-black"}
                ${isOpen ? "opacity-0" : ""}
              `}
            />

            <div
              className={`
                absolute w-4 h-0.5 transition-all duration-300
                ${darkMode ? "bg-white" : "bg-black"}
                ${isOpen ? "-rotate-45" : "translate-y-1.5"}
              `}
            />
          </button>
        </div>
      </div>

      <div
        className={`
          fixed inset-0
          bg-[#0a0a0a] text-white
          z-[110]
          flex flex-col justify-between
          p-6 sm:p-8
          transition-all duration-500
          ${isOpen
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none"
          }
        `}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
          >
            <img
              src="/cev_logo.svg"
              alt="CEV Logo"
              className="h-8 w-auto object-contain"
            />
          </Link>

          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close Menu"
            className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col space-y-6 my-auto">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-baseline gap-4 text-3xl sm:text-5xl font-extrabold text-white font-display hover:text-neutral-400 transition-colors"
            >
              <span className="text-[10px] font-mono text-neutral-600">
                0{index + 1}
              </span>

              {link.name}
            </Link>
          ))}
        </div>

        <div className="pt-6 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
          <span>CE Vadakara</span>
          <span>Official Event System</span>
        </div>
      </div>
    </header>
  );
}