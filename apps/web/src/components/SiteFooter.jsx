import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Scissors } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLang } from '@/i18n/LanguageProvider';
import { SITE } from '@/data/site';

const SiteFooter = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const { t } = useLang();

  const trust = [
    { icon: Truck, title: t('footer.trust.shipping.title'), text: t('footer.trust.shipping.text') },
    { icon: ShieldCheck, title: t('footer.trust.checkout.title'), text: t('footer.trust.checkout.text') },
    { icon: Scissors, title: t('footer.trust.handmade.title'), text: t('footer.trust.handmade.text') },
  ];

  const submit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast({ title: t('footer.toastInvalid'), variant: 'destructive' });
      return;
    }
    setEmail('');
    toast({
      title: t('footer.toastThanksTitle'),
      description: t('footer.toastThanksDesc'),
    });
  };

  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
      <div className="mx-auto grid w-full max-w-[90rem] gap-8 border-b border-border px-5 py-12 sm:px-8 md:grid-cols-3">
        {trust.map((tr) => (
          <div key={tr.title} className="flex gap-4">
            <tr.icon size={20} strokeWidth={1.4} className="mt-1 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-medium">{tr.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{tr.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto grid w-full max-w-[90rem] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.2fr_1fr_1fr_1.4fr]">
        <div>
          <p className="font-display text-3xl">{SITE.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{t('site.tagline')}</p>
          <p className="mt-4 text-sm text-muted-foreground">{SITE.address}</p>
        </div>

        <div>
          <p className="eyebrow text-muted-foreground">{t('footer.explore')}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/portfolio" className="hover:text-accent">{t('footer.collection')}</Link></li>
            <li><Link to="/shop" className="hover:text-accent">{t('footer.shop')}</Link></li>
            <li><Link to="/about" className="hover:text-accent">{t('footer.aboutMaker')}</Link></li>
            <li><Link to="/cart" className="hover:text-accent">{t('footer.cart')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-muted-foreground">{t('footer.information')}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/faq" className="hover:text-accent">{t('footer.shippingFaq')}</Link></li>
            <li><Link to="/returns" className="hover:text-accent">{t('footer.returns')}</Link></li>
            <li><Link to="/privacy" className="hover:text-accent">{t('footer.privacy')}</Link></li>
            <li><Link to="/terms" className="hover:text-accent">{t('footer.terms')}</Link></li>
            <li><Link to="/contact" className="hover:text-accent">{t('footer.contact')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-muted-foreground">{t('footer.studioLetter')}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {t('footer.studioLetterText')}
          </p>
          <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">{t('footer.emailLabel')}</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('footer.emailPlaceholder')}
              className="h-11 w-full flex-1 border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-accent"
            />
            <button
              type="submit"
              className="h-11 bg-foreground px-5 text-xs uppercase tracking-[0.18em] text-background transition-colors hover:bg-accent active:scale-[0.98]"
            >
              {t('footer.subscribe')}
            </button>
          </form>
          <div className="mt-6 flex gap-5">
            {SITE.social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="eyebrow text-muted-foreground hover:text-accent">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>{t('footer.copyright', { year: new Date().getFullYear(), name: SITE.name, domain: SITE.domain })}</p>
          <p>{SITE.email}</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
