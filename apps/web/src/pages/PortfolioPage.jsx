import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '@/components/Reveal';
import { useLang } from '@/i18n/LanguageProvider';
import { usePieces } from '@/i18n/content';
import { SITE } from '@/data/site';

const PortfolioPage = () => {
  const { t } = useLang();
  const pieces = usePieces();
  const categories = t('categories');
  const [filterIndex, setFilterIndex] = useState(0);
  const works = filterIndex === 0 ? pieces : pieces.filter((w) => w.category === categories[filterIndex]);

  return (
    <>
      <Helmet>
        <title>{t('portfolio.seoTitle')}</title>
        <meta name="description" content={t('portfolio.seoDesc')} />
        <link rel="canonical" href={`${SITE.url}/portfolio`} />
      </Helmet>

      <section className="mx-auto w-full max-w-[90rem] px-5 pb-10 pt-20 sm:px-8 sm:pt-28">
        <Reveal>
          <p className="eyebrow text-accent">{t('portfolio.eyebrow')}</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.02] sm:text-7xl">
            {t('portfolio.title')}
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.85] text-muted-foreground">
            {t('portfolio.intro')}
          </p>
        </Reveal>

        <div className="mt-12 flex flex-wrap gap-2 border-b border-border pb-6">
          {categories.map((c, i) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilterIndex(i)}
              className={`min-h-[40px] px-4 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                filterIndex === i
                  ? 'bg-foreground text-background'
                  : 'border border-border text-muted-foreground hover:border-accent hover:text-accent'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[90rem] px-5 pb-24 sm:px-8">
        {works.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            {t('portfolio.empty')}
          </p>
        ) : (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {works.map((w, i) => (
                <motion.article
                  key={w.slug}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut', delay: Math.min(i, 5) * 0.04 }}
                  className="group"
                >
                  <Link to={`/portfolio/${w.slug}`}>
                    <div className="overflow-hidden bg-secondary">
                      <img
                        src={w.image}
                        alt={w.alt}
                        loading="lazy"
                        className="h-[24rem] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="flex items-baseline justify-between gap-4 pt-4">
                      <h2 className="font-display text-2xl group-hover:text-accent">{w.title}</h2>
                      <span className="text-xs text-muted-foreground">{w.year}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{w.medium} · {w.dimensions}</p>
                    <p className="eyebrow mt-2 text-accent">{w.availability}</p>
                  </Link>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </>
  );
};

export default PortfolioPage;
