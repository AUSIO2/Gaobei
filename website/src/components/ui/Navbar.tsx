"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoViewBox, logoIconPathString, logoTextPathString } from "./Logo";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/technology", label: "核心技术" },
  { href: "/solutions", label: "解决方案" },
  { href: "/products", label: "产品中心" },
  { href: "/about", label: "关于我们" },
  { href: "/contact", label: "联系我们" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [companyInfo, setCompanyInfo] = useState<{ shortName?: string; shortNameEn?: string; name?: string; nameEn?: string } | null>(null);

  useEffect(() => {
    fetch("/api/company-info")
      .then((res) => res.json())
      .then((data) => setCompanyInfo(data))
      .catch((err) => console.error("Failed to load company info in navbar:", err));
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/technology" && pathname.startsWith("/news")) return true;
    return pathname.startsWith(href);
  };

  return (
    <>
      <motion.nav 
        className="fixed top-0 left-0 w-full px-4 sm:px-6 md:px-8 py-3 md:py-4 z-50 flex items-center justify-between bg-white/95 sm:bg-white/90 backdrop-blur-sm sm:backdrop-blur-md border-b border-neutral-200/50 shadow-sm will-change-transform"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo */}
        <div className="flex items-center w-[120px] sm:w-[135px] md:w-[150px] shrink-0">
          <Link href="/" className="w-full flex items-center">
            <svg
              width="100%"
              viewBox={logoViewBox}
            >
              <path
                d={logoIconPathString}
                stroke="var(--color-heading)"
                strokeWidth="0.8"
                fill="var(--color-heading)"
                fillRule="evenodd"
              />
              <path
                d={logoTextPathString}
                fill="var(--color-heading)"
                fillRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-2 group transition-colors ${
                isActive(link.href)
                  ? "text-brand"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {link.label}
              <span
                className={`absolute bottom-0 left-0 w-full h-[2px] bg-brand transition-transform origin-left duration-300 ${
                  isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          ))}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
        >
          <motion.span
            className="block w-5 h-[2px] bg-neutral-800 rounded-full"
            animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.span
            className="block w-5 h-[2px] bg-neutral-800 rounded-full mt-1"
            animate={mobileMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block w-5 h-[2px] bg-neutral-800 rounded-full mt-1"
            animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25 }}
          />
        </button>
      </motion.nav>

      {/* Mobile Menu Overlay + Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-[49] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in Menu */}
            <motion.div
              className="fixed top-0 right-0 h-full w-[75vw] max-w-[300px] bg-white shadow-2xl z-[51] md:hidden flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase">导航菜单</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
                  aria-label="关闭菜单"
                >
                  <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav Items */}
              <nav className="flex-1 px-3 py-4 overflow-y-auto">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                        isActive(link.href)
                          ? "bg-brand/5 text-brand"
                          : "text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100"
                      }`}
                    >
                      {isActive(link.href) && (
                        <span className="w-1 h-4 bg-brand rounded-full mr-3 shrink-0" />
                      )}
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Menu Footer */}
              <div className="px-5 py-4 border-t border-neutral-100">
                <p className="text-[10px] text-neutral-400 font-light tracking-wider uppercase">
                  {(companyInfo?.shortName || companyInfo?.name || "云路复材")} {(companyInfo?.shortNameEn || companyInfo?.nameEn || "YUNLU COMPOSITES")}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
