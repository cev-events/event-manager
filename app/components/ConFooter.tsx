// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    const isHideRoute =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/login");

    const isNotFound = typeof document !== 'undefined' && !!document.getElementById("not-found-page");

    setShouldHide(isHideRoute || isNotFound);
  }, [pathname]);

  if (shouldHide) {
    return null;
  }

  return <Footer />;
}
