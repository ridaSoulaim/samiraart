import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { useLang } from '@/i18n/LanguageProvider';
import { usePieces } from '@/i18n/content';
import { SITE } from '@/data/site';

const ArtworkDetailPage = () => {
  const { slug } = useParams();
  const { t } = useLang();
  const pieces = usePieces();
  const work = pieces.find((w) => w.slug === slug);
  const others = pieces.filter((w) => w.slug !== slug).slice(0, 3);

  if (!work) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-32 text-center">
        <Helmet>
          <title>{t('artwork.seoNotFound')}</title>
          <meta name="description" content={t('artwork.seoNotFoundDesc')} />
        </Helmet>
        <h1 className="font-display text-4xl">{t('artwork.notFoundTitle')}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{t('artwork.notFoundText')}</p>
        <Link to="/portfolio" className="eyebrow mt-8 inline-block border-b border-accent pb-1 text-accent">
          {t('artwork.notFoundCta')}
        </Link>
      </div>
    );
  }

  const meta = [
    [t('artwork.materials'), work.medium],
    [t('artwork.dimensions'), work.dimensions],
    [t('artwork.availability'), work.availability],
    [t('artwork.finish'), t('artwork.finishValue')],
    [t('artwork.shipping'), t('artwork.shippingValue')],
  ];

  return (
    <>
      <Helmet>
        <title>{`${work.title} (${work.year}) — Samira Art`}</title>
        <meta name="description" content={`${work.title}, ${work.year}. ${work.medium}, ${work.dimensions}. ${work.note}`} />
        <link rel="canonical" href={`${SITE.url}/portfolio/${work.slug}`} />
      </Helmet>

      <div className="mx-auto w-full max-w-[90rem] px-5 pt-10 sm:px-8">
        <Link to="/portfolio" className="eyebrow inline-flex items-center gap-2 text-muted-foreground hover:text-accent">
          <ArrowLeft size={14} strokeWidth={1.5} /> {t('artwork.backCollection')}
        </Link>
      </div>

      <article className="mx-auto grid w-full max-w-[90rem] gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:gap-20 lg:py-16">
        <Reveal>
          <img src={work.image} alt={work.alt} className="w-full bg-secondary object-cover" />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow text-accent">{work.category}</p>
            <h1 className="mt-4 font-display text-5xl leading-tight">{work.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{work.year}</p>
            <p className="mt-8 text-[15px] leading-[1.9] text-muted-foreground">{work.note}</p>

            <dl className="mt-10 divide-y divide-border border-y border-border text-sm">
              {meta.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/shop" className="flex min-h-[48px] flex-1 items-center justify-center gap-2 bg-foreground px-6 text-[11px] uppercase tracking-[0.2em] text-background transition-colors hover:bg-accent active:scale-[0.99]">
                {t('artwork.shopCraft')} <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
              <Link to="/contact" className="flex min-h-[48px] flex-1 items-center justify-center border border-foreground/30 px-6 text-[11px] uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent active:scale-[0.99]">
                {t('artwork.enquire')}
              </Link>
            </div>
          </div>
        </Reveal>
      </article>

      <section className="border-t border-border py-20">
        <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8">
          <h2 className="font-display text-3xl">{t('artwork.moreTitle')}</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {others.map((o) => (
              <Link key={o.slug} to={`/portfolio/${o.slug}`} className="group">
                <div className="overflow-hidden bg-secondary">
                  <img src={o.image} alt={o.alt} loading="lazy" className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <p className="mt-4 font-display text-xl group-hover:text-accent">{o.title}</p>
                <p className="text-sm text-muted-foreground">{o.dimensions}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ArtworkDetailPage;
