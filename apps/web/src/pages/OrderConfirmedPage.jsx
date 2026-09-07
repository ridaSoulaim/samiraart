import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useLang } from '@/i18n/LanguageProvider';
import { SITE } from '@/data/site';

const OrderConfirmedPage = () => {
  const { t } = useLang();
  return (
    <>
      <Helmet>
        <title>{t('order.seoTitle')}</title>
        <meta name="description" content={t('order.seoDesc')} />
        <link rel="canonical" href={`${SITE.url}/order-confirmed`} />
      </Helmet>

      <section className="mx-auto w-full max-w-[48rem] px-5 py-28 text-center sm:px-8 sm:py-36">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent text-accent">
          <Check size={26} strokeWidth={1.4} />
        </span>
        <h1 className="mt-8 font-display text-5xl leading-tight">{t('order.title')}</h1>
        <p className="mx-auto mt-5 max-w-prose text-[15px] leading-[1.9] text-muted-foreground">
          {t('order.text')}
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/shop" className="min-h-[48px] bg-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-background hover:bg-accent">
            {t('order.continue')}
          </Link>
          <Link to="/contact" className="min-h-[48px] border border-foreground/30 px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:border-accent hover:text-accent">
            {t('order.contact')}
          </Link>
        </div>
      </section>
    </>
  );
};

export default OrderConfirmedPage;
