import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { ProductCard, ProductGridSkeleton, isSoldOut, useStoreProducts } from '@/components/ProductsList';
import Reveal from '@/components/Reveal';
import { useLang } from '@/i18n/LanguageProvider';
import { SITE } from '@/data/site';

const matchesCategory = (product, id) => {
  if (id === 'all') return true;
  const typeValue = (product.type?.value || '').toLowerCase();
  if (typeValue === id) return true;
  const title = (product.title || '').toLowerCase();
  if (id === 'embroideries') return /embroider|broder/.test(title);
  if (id === 'pearl-bracelets') return /pearl|bracelet|perle/.test(title);
  return true;
};

const ShopPage = () => {
  const { t } = useLang();
  const { products, loading, error } = useStoreProducts();
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  const sorts = t('shop.sorts');
  const sortOptions = [
    { value: 'featured', label: sorts.featured },
    { value: 'price-asc', label: sorts.priceAsc },
    { value: 'price-desc', label: sorts.priceDesc },
    { value: 'title', label: sorts.title },
  ];
  const categories = [
    { id: 'all', title: t('categories.0') },
    { id: 'embroideries', title: t('categories.1') },
    { id: 'pearl-bracelets', title: t('categories.2') },
  ];

  const visible = useMemo(() => {
    let list = products.filter((p) => matchesCategory(p, category));
    if (inStockOnly) list = list.filter((p) => !isSoldOut(p));
    if (sort === 'price-asc') list.sort((a, b) => a.price_in_cents - b.price_in_cents);
    if (sort === 'price-desc') list.sort((a, b) => b.price_in_cents - a.price_in_cents);
    if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'featured') list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return list;
  }, [products, category, sort, inStockOnly]);

  return (
    <>
      <Helmet>
        <title>{t('shop.seoTitle')}</title>
        <meta name="description" content={t('shop.seoDesc')} />
        <link rel="canonical" href={`${SITE.url}/shop`} />
      </Helmet>

      <section className="mx-auto w-full max-w-[90rem] px-5 pt-20 sm:px-8 sm:pt-28">
        <Reveal>
          <p className="eyebrow text-accent">{t('shop.eyebrow')}</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.02] sm:text-7xl">
            {t('shop.title')}
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.85] text-muted-foreground">
            {t('shop.intro')}
          </p>
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-[90rem] px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-5 border-y border-border py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`min-h-[40px] px-4 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  category === c.id ? 'bg-foreground text-background' : 'border border-border text-muted-foreground hover:border-accent hover:text-accent'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <label className="flex cursor-pointer items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 accent-[hsl(var(--accent))]"
              />
              {t('shop.availableOnly')}
            </label>
            <label className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t('shop.sort')}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 border border-border bg-background px-3 text-xs uppercase tracking-[0.14em] outline-none focus:border-accent"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-14 pb-10">
          {loading && <ProductGridSkeleton count={6} />}
          {!loading && error && (
            <p className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              {t('shop.error', { msg: error })}
            </p>
          )}
          {!loading && !error && visible.length === 0 && (
            <p className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              {t('shop.noMatch')}
            </p>
          )}
          {!loading && !error && visible.length > 0 && (
            <>
              <p className="mb-8 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {visible.length === 1
                  ? t('shop.onePiece', { count: visible.length })
                  : t('shop.manyPieces', { count: visible.length })}
              </p>
              <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default ShopPage;
