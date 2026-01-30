"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { routes, display } from "@/resources";
import styles from "./MobileNav.module.scss";

/**
 * Mobile Navigation Icons
 * Simple SVG icons for bottom tab navigation
 */
const NavIcons = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  work: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  blog: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  designs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

type NavItem = {
  path: string;
  label: string;
  icon: keyof typeof NavIcons;
  enabled: boolean;
};

/**
 * Build navigation items from routes config
 */
function getNavItems(): NavItem[] {
  const items: NavItem[] = [
    { path: "/", label: "Home", icon: "home", enabled: true },
    { path: "/work", label: "Work", icon: "work", enabled: routes["/work"] },
    { path: "/blog", label: "Blog", icon: "blog", enabled: routes["/blog"] },
    { path: "/designs", label: "Designs", icon: "designs", enabled: routes["/designs"] },
    { path: "/about", label: "About", icon: "about", enabled: routes["/about"] },
  ];

  return items.filter((item) => item.enabled);
}

/**
 * Mobile Bottom Tab Navigation
 * Only renders on screens < 768px via CSS
 */
export function MobileNav() {
  const pathname = usePathname();
  const navItems = getNavItems();

  // Limit to 5 items max for bottom nav
  const displayItems = navItems.slice(0, 5);

  return (
    <nav className={styles.mobileNav} aria-label="Mobile navigation">
      <ul className={styles.mobileNav__list}>
        {displayItems.map((item) => {
          const isActive =
            item.path === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.path);

          return (
            <li key={item.path} className={styles.mobileNav__item}>
              <Link
                href={item.path}
                className={`${styles.mobileNav__link} ${isActive ? styles["mobileNav__link--active"] : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={styles.mobileNav__icon}>
                  {NavIcons[item.icon]}
                </span>
                <span className={styles.mobileNav__label}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default MobileNav;
