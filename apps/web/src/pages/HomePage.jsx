import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';
import Seo from '@/components/Seo';
import ProductsList from '@/components/ProductsList';
import { useLang } from '@/i18n/LanguageProvider';
import { usePieces } from '@/i18n/content';
import { IMAGES, SITE } from '@/data/site';

const HomePage = () => {
  const { t } = useLang();
  const pieces = usePieces();
  const featured = pieces.slice(0, 3);
  const marqueeWords = t('home.marquee');
  const categories = t('home.cats').map((c, i) => ({
    ...c,
    image: [IMAGES.hero, IMAGES.flat, IMAGES.packing][i],
    to: i === 2 ? '/contact' : '/shop',
  }));

  return (
    <>
      <Helmet>
        <title>{t('home.seoTitle')}</title>
        <meta name="description" content={t('home.seoDesc')} />
        <link rel="canonical" href={`${SITE.url}/`} />
      </Helmet>
      <Seo
        title={t('home.seoOgTitle')}
        description={t('home.seoOgDesc')}
        image={IMAGES.hero}
        url={SITE.url}
        siteName={SITE.name}
      />

      {/* Hero — full-bleed story image with editorial overlay */}
      <section className="relative flex min-h-[100dvh] items-end overflow-hidden">
        <motion.img
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          src={IMAGES.hero}
          alt={t('home.heroEyebrow')}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(30_8%_12%_/_0.72)] via-[hsl(30_8%_12%_/_0.25)] to-transparent" />
        <div className="relative mx-auto w-full max-w-[90rem] px-5 pb-16 pt-32 sm:px-8 sm:pb-24">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="eyebrow text-[hsl(40_33%_92%)]"
          >
            {t('home.heroEyebrow')}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.75, ease: 'easeOut' }}
            className="mt-5 max-w-4xl font-display text-[3rem] leading-[0.95] text-[hsl(40_36%_96%)] sm:text-[4.5rem] lg:text-[6rem]"
          >
            {t('home.heroTitle1')}
            <span className="block italic text-[hsl(24_55%_74%)]">{t('home.heroTitle2')}</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/portfolio"
              className="flex min-h-[48px] items-center justify-center gap-3 bg-[hsl(40_36%_96%)] px-8 text-[11px] uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:scale-[0.99]"
            >
              {t('home.heroCtaCollection')} <ArrowRight size={15} strokeWidth={1.5} />
            </Link>
            <Link
              to="/shop"
              className="flex min-h-[48px] items-center justify-center border border-[hsl(40_36%_96%_/_0.6)] px-8 text-[11px] uppercase tracking-[0.2em] text-[hsl(40_36%_96%)] transition-colors hover:bg-[hsl(40_36%_96%_/_0.12)] active:scale-[0.99]"
            >
              {t('home.heroCtaShop')}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Ticker */}
      <div className="overflow-hidden border-y border-border bg-secondary/60 py-3">
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
          {[...marqueeWords, ...marqueeWords, ...marqueeWords, ...marqueeWords].map((w, i) => (
            <span key={i} className="eyebrow text-muted-foreground">
              {w} <span className="ml-10 text-accent">/</span>
            </span>
          ))}
        </div>
      </div>

      {/* Maker introduction — asymmetric split */}
      <section className="mx-auto grid w-full max-w-[72rem] gap-12 px-5 py-24 sm:px-8 md:grid-cols-[0.85fr_1.15fr] md:items-center md:py-32">
        <Reveal>
          <img
            src={IMAGES.artist}
            alt={t('home.makerEyebrow')}
            className="w-full object-cover md:aspect-[3/4]"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="eyebrow text-accent">{t('home.makerEyebrow')}</p>
          <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            {t('home.makerTitle')}
          </h2>
          <p className="mt-6 max-w-prose text-[15px] leading-[1.85] text-muted-foreground">
            {t('home.makerP1')}
          </p>
          <p className="mt-4 max-w-prose text-[15px] leading-[1.85] text-muted-foreground">
            {t('home.makerP2')}
          </p>
          <Link
            to="/about"
            className="eyebrow mt-8 inline-flex items-center gap-2 border-b border-foreground pb-1 hover:border-accent hover:text-accent"
          >
            {t('home.makerLink')} <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </Reveal>
      </section>

      {/* Featured pieces — editorial zig-zag */}
      <section className="border-y border-border bg-secondary/40 py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[72rem] px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-accent">{t('home.featuredEyebrow')}</p>
                <h2 className="mt-3 font-display text-4xl sm:text-5xl">{t('home.featuredTitle')}</h2>
              </div>
              <Link to="/portfolio" className="eyebrow border-b border-foreground pb-1 hover:border-accent hover:text-accent">
                {t('home.allPieces')}
              </Link>
            </div>
          </Reveal>

          <div className="mt-16 space-y-20">
            {featured.map((work, i) => (
              <Reveal key={work.slug} delay={0.05}>
                <article
                  className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${i % 2 ? 'md:[&>figure]:order-2' : ''}`}
                >
                  <figure className="overflow-hidden bg-background">
                    <Link to={`/portfolio/${work.slug}`}>
                      <img
                        src={work.image}
                        alt={work.alt}
                        loading="lazy"
                        className="h-72 w-full object-cover transition-transform duration-700 hover:scale-[1.03] sm:h-[26rem]"
                      />
                    </Link>
                  </figure>
                  <div>
                    <p className="eyebrow text-muted-foreground">{work.category} — {work.year}</p>
                    <h3 className="mt-3 font-display text-3xl sm:text-4xl">{work.title}</h3>
                    <p className="mt-4 max-w-prose text-[15px] leading-[1.85] text-muted-foreground">{work.note}</p>
                    <p className="mt-4 text-sm text-muted-foreground">{work.medium} · {work.dimensions}</p>
                    <Link
                      to={`/portfolio/${work.slug}`}
                      className="eyebrow mt-6 inline-block border-b border-foreground pb-1 hover:border-accent hover:text-accent"
                    >
                      {t('home.viewDetail')}
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Shop categories */}
      <section className="mx-auto w-full max-w-[90rem] px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="eyebrow text-accent">{t('home.shopEyebrow')}</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl sm:text-5xl">
            {t('home.shopTitle')}
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <Link to={c.to} className="group block">
                <div className="overflow-hidden">
                  <img
                    src={c.image}
                    alt={`${c.title} — ${c.text}`}
                    loading="lazy"
                    className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                </div>
                <h3 className="mt-5 font-display text-2xl group-hover:text-accent">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Available now */}
      <section className="border-t border-border py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-4xl sm:text-5xl">{t('home.availableTitle')}</h2>
              <Link to="/shop" className="eyebrow border-b border-foreground pb-1 hover:border-accent hover:text-accent">
                {t('home.enterShop')}
              </Link>
            </div>
          </Reveal>
          <div className="mt-14">
            <ProductsList limit={3} />
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
