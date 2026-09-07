import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { useLang } from '@/i18n/LanguageProvider';
import { useFaqs } from '@/i18n/content';
import { SITE } from '@/data/site';

const FaqPage = () => {
  const { t } = useLang();
  const faqs = useFaqs();
  const [open, setOpen] = useState(0);

  return (
    <>
      <Helmet>
        <title>{t('faq.seoTitle')}</title>
        <meta name="description" content={t('faq.seoDesc')} />
        <link rel="canonical" href={`${SITE.url}/faq`} />
      </Helmet>

      <section className="mx-auto w-full max-w-[56rem] px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <p className="eyebrow text-accent">{t('faq.eyebrow')}</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] sm:text-6xl">{t('faq.title')}</h1>
          <p className="mt-6 max-w-prose text-[15px] leading-[1.9] text-muted-foreground">
            {t('faq.intro')}
          </p>
        </Reveal>

        <div className="mt-14 border-t border-border">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="font-display text-2xl leading-snug">{f.q}</span>
                  {isOpen ? <Minus size={18} className="shrink-0 text-accent" /> : <Plus size={18} className="shrink-0 text-muted-foreground" />}
                </button>
                {isOpen && (
                  <p className="max-w-prose pb-7 text-[15px] leading-[1.9] text-muted-foreground">{f.a}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-14 border border-border bg-card p-8 text-center">
          <p className="font-display text-2xl">{t('faq.stillTitle')}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t('faq.stillText')}</p>
          <Link to="/contact" className="mt-6 inline-block bg-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-background hover:bg-accent">
            {t('faq.contactCta')}
          </Link>
        </div>
      </section>
    </>
  );
};

export default FaqPage;
