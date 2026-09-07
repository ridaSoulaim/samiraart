import React from 'react';
import { Helmet } from 'react-helmet';
import { useLang } from '@/i18n/LanguageProvider';
import { SITE } from '@/data/site';

const LegalPage = ({ page }) => {
  const { t } = useLang();
  const c = t(`legal.${page}`);
  const sections = c.sections.map(([heading, body]) => [
    heading,
    body.replace('{email}', SITE.email),
  ]);

  return (
    <>
      <Helmet>
        <title>{`${c.title} — Samira Art`}</title>
        <meta name="description" content={c.meta} />
        <link rel="canonical" href={`${SITE.url}/${c.path}`} />
      </Helmet>

      <section className="mx-auto w-full max-w-[52rem] px-5 py-20 sm:px-8 sm:py-28">
        <p className="eyebrow text-accent">{t('legal.eyebrow')}</p>
        <h1 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">{c.title}</h1>
        <p className="mt-6 max-w-prose text-[15px] leading-[1.9] text-muted-foreground">{c.intro}</p>

        <div className="mt-12 divide-y divide-border border-t border-border">
          {sections.map(([heading, body]) => (
            <div key={heading} className="py-8">
              <h2 className="font-display text-2xl">{heading}</h2>
              <p className="mt-3 max-w-prose text-[15px] leading-[1.9] text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          {t('legal.lastUpdated', { year: new Date().getFullYear(), domain: SITE.domain })}
        </p>
      </section>
    </>
  );
};

export default LegalPage;
