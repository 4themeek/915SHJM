'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { cartCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleMenu() {
    setMenuOpen(prev => !prev);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/promises', label: 'The 12 Promises' },
    { href: '/immaculate-heart', label: 'Immaculate Heart' },
    { href: '/holy-spirit', label: 'Holy Spirit' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/donate', label: 'Donate' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.inner}>
          {/* LOGO */}
          <Link href="/" className={styles.logo} onClick={closeMenu}>
            The Sacred Hearts
          </Link>

          {/* DESKTOP LINKS */}
          <div className={styles.links}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
            <button className={styles.cartBtn} onClick={openCart} aria-label="Open cart">
              Cart ({cartCount})
            </button>
          </div>

          {/* MOBILE RIGHT — cart + hamburger */}
          <div className={styles.mobileRight}>
            <button className={styles.cartBtnMobile} onClick={openCart} aria-label="Open cart">
              Cart ({cartCount})
            </button>
            <button
              className={styles.hamburger}
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {menuOpen && (
        <div className={styles.mobileOverlay} onClick={closeMenu} aria-hidden="true" />
      )}

      {/* MOBILE MENU DRAWER */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <span className={styles.mobileMenuTitle}>✦ The Sacred Hearts</span>
          <button className={styles.mobileClose} onClick={closeMenu} aria-label="Close menu">×</button>
        </div>
        <div className={styles.mobileLinks}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.mobileLink}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          <button
            className={styles.mobileCartBtn}
            onClick={() => { closeMenu(); openCart(); }}
          >
            Cart ({cartCount})
          </button>
        </div>
      </div>
    </>
  );
}
