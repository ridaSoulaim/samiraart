import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ShoppingBag, Languages } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useLang } from '@/i18n/LanguageProvider';
import { SITE } from '@/data/site';
import { isAdminAuthenticatedApi } from '@/api/AdminApi';

const SiteHeader = ({ onOpenCart }) => {
  const [open, setOpen] = useState(false);
  const { cartItems } = useCart();
  const { t, toggle, lang } = useLang();
  const count = cartItems.reduce((n, i) => n + i.quantity, 0);

  const links = [
    { to: '/portfolio', label: t('nav.collection') },
    { to: '/shop', label: t('nav.shop') },
    { to: '/about', label: t('nav.about') },
    { to: '/faq', label: t('nav.faq') },
    { to: '/contact', label: t('nav.contact') },
    ...(isAdminAuthenticatedApi() ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  const linkClass = ({ isActive }) =>
    `eyebrow transition-colors ${isActive ? 'text-accent' : 'text-foreground/70 hover:text-foreground'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="font-display text-2xl leading-none tracking-wide sm:text-[1.7rem]">
          {SITE.name}
          <span className="text-accent">.</span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={t('header.langAria')}
            title={t('header.langAria')}
            className="flex h-11 min-w-11 items-center justify-center gap-1.5 px-2 text-foreground/80 transition-colors hover:text-accent active:scale-[0.98]"
          >
            <Languages size={18} strokeWidth={1.5} />
            <span className="eyebrow hidden sm:inline">{lang === 'en' ? 'FR' : 'EN'}</span>
          </button>
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={t('header.cartAria', { count })}
            className="relative flex h-11 min-w-11 items-center justify-center gap-2 px-3 text-foreground/80 transition-colors hover:text-accent active:scale-[0.98]"
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            <span className="eyebrow hidden sm:inline">{t('header.cart')}</span>
            {count > 0 && (
              <span className="absolute right-0 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground">
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={t('header.toggleMenu')}
            className="flex h-11 w-11 items-center justify-center text-foreground md:hidden"
          >
            {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border/70 bg-background px-5 pb-5 pt-2 md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block border-b border-border/60 py-4 font-display text-2xl"
            >
              {l.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => { toggle(); setOpen(false); }}
            className="mt-4 flex w-full items-center justify-center gap-2 border border-border py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-accent hover:text-accent"
          >
            <Languages size={16} strokeWidth={1.5} />
            {t('header.switchTo')}
          </button>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
