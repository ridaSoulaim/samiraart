import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Reveal from '@/components/Reveal';
import CountUp from '@/components/CountUp';
import { useLang } from '@/i18n/LanguageProvider';
import { IMAGES, SITE } from '@/data/site';

const AboutPage = () => {
  const { t } = useLang();
  const process = t('about.process');
  const stats = [
    { value: 2016, label: t('about.stat1'), suffix: '' },
    { value: 240, label: t('about.stat2'), suffix: '+' },
    { value: 31, label: t('about.stat3'), suffix: '' },
  ];
  const gallery = [
    { src: IMAGES.texture, alt: t('about.processEyebrow') },
    { src: IMAGES.packing, alt: t('about.processEyebrow') },
    { src: IMAGES.flat, alt: t('about.processEyebrow') },
  ];

  return (
    <>
      <Helmet>
        <title>{t('about.seoTitle')}</title>
        <meta name="description" content={t('about.seoDesc')} />
        <link rel="canonical" href={`${SITE.url}/about`} />
      </Helmet>

      <section className="mx-auto grid w-full max-w-[90rem] gap-12 px-5 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <Reveal>
          <p className="eyebrow text-accent">{t('about.eyebrow')}</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] sm:text-7xl">
            {t('about.title1')}
            <span className="block italic text-accent">{t('about.title2')}</span>
          </h1>
          <p className="mt-8 max-w-prose text-[15px] leading-[1.9] text-muted-foreground">
            {t('about.intro')}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <img src={IMAGES.artist} alt={t('about.eyebrow')} className="w-full object-cover lg:aspect-[3/4]" />
        </Reveal>
      </section>

      <section className="mx-auto grid w-full max-w-[72rem] gap-8 px-5 py-20 sm:grid-cols-3 sm:px-8">
        {stats.map((s) => (
          <Reveal key={s.label}>
            <div className="border-t border-border pt-5">
              <p className="font-display text-5xl">
                <CountUp value={s.value} suffix={s.suffix} />
              </p>
              <p className="eyebrow mt-2 text-muted-foreground">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="border-y border-border bg-secondary/40 py-24">
        <div className="mx-auto w-full max-w-[72rem] px-5 sm:px-8">
          <Reveal>
            <p className="eyebrow text-accent">{t('about.processEyebrow')}</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">{t('about.processTitle')}</h2>
          </Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <Reveal>
              <img src={IMAGES.studio} alt={t('about.processEyebrow')} className="h-full w-full object-cover" />
            </Reveal>
            <div className="space-y-8">
              {process.map((p, i) => (
                <Reveal key={p.step} delay={i * 0.06}>
                  <div className="border-l-2 border-accent/60 pl-5">
                    <p className="eyebrow text-muted-foreground">{p.step}</p>
                    <h3 className="mt-1 font-display text-2xl">{p.title}</h3>
                    <p className="mt-2 text-[15px] leading-[1.85] text-muted-foreground">{p.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[90rem] gap-6 px-5 py-20 sm:px-8 md:grid-cols-3">
        {gallery.map((img) => (
          <Reveal key={img.src}>
            <img src={img.src} alt={img.alt} loading="lazy" className="h-72 w-full object-cover" />
          </Reveal>
        ))}
      </section>

      <section className="mx-auto w-full max-w-[56rem] px-5 pb-24 text-center sm:px-8">
        <Reveal>
          <h2 className="font-display text-4xl sm:text-5xl">{t('about.customTitle')}</h2>
          <p className="mx-auto mt-5 max-w-prose text-[15px] leading-[1.9] text-muted-foreground">
            {t('about.customText')}
          </p>
          <Link to="/contact" className="mt-8 inline-block bg-foreground px-9 py-4 text-[11px] uppercase tracking-[0.2em] text-background hover:bg-accent">
            {t('about.customCta')}
          </Link>
        </Reveal>
      </section>
    </>
  );
};

export default AboutPage;
