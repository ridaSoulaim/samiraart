import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProduct, getProductQuantities } from '@/api/EcommerceApi';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { useLang } from '@/i18n/LanguageProvider';
import { ArrowLeft, Minus, Plus, Truck, ShieldCheck, Scissors } from 'lucide-react';
import { SITE } from '@/data/site';
import { readAdminProductsIfAny } from '@/lib/adminStorage';
import { getAdminProducts } from '@/api/AdminApi';

const placeholderImage =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRUZFN0RCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzlBOEU3RSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlN0dWRpbyBwaWVjZTwvdGV4dD48L3N2Zz4=";

function ProductDetailPage() {
  const { id } = useParams();
  const { t } = useLang();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const details = [
    { icon: Truck, text: t('product.details.0') },
    { icon: ShieldCheck, text: t('product.details.1') },
    { icon: Scissors, text: t('product.details.2') },
  ];

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Try admin / database products first
        let adminMatch = null;
        try {
          const databaseProducts = await getAdminProducts();
          adminMatch = databaseProducts.find((p) => p.id === id) || null;
        } catch {
          // database unavailable – fall through
        }
        if (!adminMatch) {
          const localProducts = readAdminProductsIfAny();
          adminMatch = localProducts.find((p) => p.id === id) || null;
        }

        if (adminMatch) {
          const normalized = {
            ...adminMatch,
            id: adminMatch.id,
            title: adminMatch.title,
            subtitle: adminMatch.subtitle,
            ribbon_text: adminMatch.ribbon_text,
            description: adminMatch.description,
            image: adminMatch.image || adminMatch.images?.[0]?.url || '',
            price_in_cents: Number(adminMatch.price_in_cents ?? adminMatch.variants?.[0]?.price_in_cents ?? 0),
            currency: adminMatch.currency || 'MAD',
            purchasable: adminMatch.purchasable !== false,
            order: Number(adminMatch.order ?? 0),
            images: Array.isArray(adminMatch.images) && adminMatch.images.length
              ? adminMatch.images
              : adminMatch.image ? [{ url: adminMatch.image, order: 0, type: 'main' }] : [],
            variants: Array.isArray(adminMatch.variants) && adminMatch.variants.length
              ? adminMatch.variants.map((variant) => {
                  const price = Number(variant.price_in_cents ?? adminMatch.price_in_cents ?? 0);
                  return {
                    ...variant,
                    price_in_cents: price,
                    price_formatted: variant.price_formatted || `MAD ${(price / 100).toFixed(2)}`,
                    inventory_quantity: Number(variant.inventory_quantity ?? 1),
                    image_url: variant.image_url || adminMatch.image || '',
                  };
                })
              : (() => {
                  const fallbackPrice = Number(adminMatch.price_in_cents ?? 0);
                  return [{
                    id: `${adminMatch.id}-default`,
                    title: 'Default',
                    image_url: adminMatch.image || '',
                    sku: '',
                    price_in_cents: fallbackPrice,
                    sale_price_in_cents: null,
                    currency: adminMatch.currency || 'MAD',
                    currency_info: { code: 'MAD', symbol: 'MAD ', template: '$1', decimal_digits: 2 },
                    price_formatted: `MAD ${(fallbackPrice / 100).toFixed(2)}`,
                    sale_price_formatted: null,
                    manage_inventory: true,
                    inventory_quantity: 1,
                    weight: null,
                    options: [],
                  }];
                })(),
          };
          if (!active) return;
          setProduct(normalized);
          setSelectedVariant(normalized.variants?.[0] || null);
          setImageIndex(0);
          setLoading(false);
          setError(null);
          return;
        }

        // 2. Fall back to the ecommerce API
        const fetched = await getProduct(id);
        const quantities = await getProductQuantities({
          fields: 'inventory_quantity',
          product_ids: [fetched.id],
        });
        const map = new Map(quantities.variants.map((v) => [v.id, v.inventory_quantity]));
        const merged = {
          ...fetched,
          variants: fetched.variants.map((v) => ({
            ...v,
            inventory_quantity: map.get(v.id) ?? v.inventory_quantity,
          })),
        };
        if (!active) return;
        setProduct(merged);
        setSelectedVariant(merged.variants?.[0] || null);
        setImageIndex(0);
      } catch (err) {
        if (active) setError(err.message || 'Failed to load this piece');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProduct();
    return () => { active = false; };
  }, [id]);

  const handleVariantSelect = useCallback(
    (variant) => {
      setSelectedVariant(variant);
      if (variant.image_url && product?.images?.length) {
        const i = product.images.findIndex((img) => img.url === variant.image_url);
        if (i !== -1) setImageIndex(i);
      }
    },
    [product],
  );

  const handleAddToCart = useCallback(async () => {
    if (!product || !selectedVariant) return;
    try {
      await addToCart(product, selectedVariant, quantity, selectedVariant.inventory_quantity);
      toast({ title: t('product.toastAddedTitle'), description: t('product.toastAddedDesc', { count: quantity, title: product.title }) });
    } catch (err) {
      toast({ title: t('product.toastAddFailTitle'), description: err.message, variant: 'destructive' });
    }
  }, [product, selectedVariant, quantity, addToCart, toast, t]);

  if (loading) {
    return (
      <div className="mx-auto grid w-full max-w-[90rem] animate-pulse gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
        <div className="h-[34rem] bg-secondary" />
        <div className="space-y-4">
          <div className="h-10 w-2/3 bg-secondary" />
          <div className="h-4 w-1/3 bg-secondary" />
          <div className="h-24 w-full bg-secondary" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-32 text-center">
        <Helmet>
          <title>{t('product.seoUnavailable')}</title>
          <meta name="description" content={t('product.seoUnavailableDesc')} />
        </Helmet>
        <h1 className="font-display text-4xl">{t('product.unavailableTitle')}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{error}</p>
        <Link to="/shop" className="eyebrow mt-8 inline-block border-b border-accent pb-1 text-accent">
          {t('product.backShop')}
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: product.image }];
  const currentImage = images[imageIndex]?.url || product.image || placeholderImage;
  const price = selectedVariant?.sale_price_formatted || selectedVariant?.price_formatted;
  const original = selectedVariant?.sale_price_in_cents ? selectedVariant.price_formatted : null;
  const stockManaged = selectedVariant?.manage_inventory ?? false;
  const stock = selectedVariant?.inventory_quantity ?? 0;
  const soldOut = stockManaged && stock <= 0;
  const canAdd = product.purchasable && !soldOut && (!stockManaged || quantity <= stock);
  const plainDescription = (product.description || '').replace(/<[^>]*>/g, '').slice(0, 158);

  return (
    <>
      <Helmet>
        <title>{`${product.title} — Samira Art`}</title>
        <meta name="description" content={plainDescription || `${product.title}, available from the Samira Art studio.`} />
        <link rel="canonical" href={`${SITE.url}/product/${product.id}`} />
      </Helmet>

      <div className="mx-auto w-full max-w-[90rem] px-5 pt-10 sm:px-8">
        <Link to="/shop" className="eyebrow inline-flex items-center gap-2 text-muted-foreground hover:text-accent">
          <ArrowLeft size={14} strokeWidth={1.5} /> {t('product.backShop')}
        </Link>
      </div>

      <div className="mx-auto grid w-full max-w-[90rem] gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="overflow-hidden bg-secondary">
            <img src={currentImage || placeholderImage} alt={product.title} className="max-h-[38rem] w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  aria-label={t('product.viewImage', { n: i + 1 })}
                  className={`h-20 w-16 shrink-0 overflow-hidden border transition-colors ${
                    i === imageIndex ? 'border-accent' : 'border-border hover:border-foreground/40'
                  }`}
                >
                  <img src={img.url || placeholderImage} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:sticky lg:top-28 lg:self-start"
        >
          {product.ribbon_text && <p className="eyebrow text-accent">{product.ribbon_text}</p>}
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{product.title}</h1>
          {product.subtitle && <p className="mt-2 text-sm text-muted-foreground">{product.subtitle}</p>}

          <p className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl">{price}</span>
            {original && <span className="text-sm text-muted-foreground line-through">{original}</span>}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {soldOut ? t('product.sold') : stockManaged ? t('product.nAvailable', { count: stock }) : t('product.available')}
          </p>

          {product.description && (
            <div
              className="prose-sm mt-6 max-w-prose text-[15px] leading-[1.85] text-muted-foreground [&_p]:mb-3"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          {product.variants.length > 1 && (
            <div className="mt-8">
              <p className="eyebrow text-muted-foreground">{t('product.options')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleVariantSelect(v)}
                    className={`min-h-[44px] px-4 text-[11px] uppercase tracking-[0.16em] transition-colors ${
                      selectedVariant?.id === v.id
                        ? 'bg-foreground text-background'
                        : 'border border-border hover:border-accent hover:text-accent'
                    }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-12 w-fit items-center border border-border">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="px-4 py-3 hover:text-accent">
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity" className="px-4 py-3 hover:text-accent">
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!canAdd}
              className="min-h-[48px] flex-1 bg-foreground px-8 text-[11px] uppercase tracking-[0.2em] text-background transition-colors hover:bg-accent active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              {soldOut ? t('product.sold') : !product.purchasable ? t('product.currentlyUnavailable') : t('product.addToCart')}
            </button>
          </div>
          {stockManaged && !soldOut && quantity > stock && (
            <p className="mt-3 text-xs text-destructive">{t('product.onlyN', { count: stock })}</p>
          )}

          <ul className="mt-10 space-y-3 border-t border-border pt-6">
            {details.map((d) => (
              <li key={d.text} className="flex gap-3 text-sm text-muted-foreground">
                <d.icon size={17} strokeWidth={1.4} className="mt-0.5 shrink-0 text-accent" />
                {d.text}
              </li>
            ))}
          </ul>

          {product.additional_info?.length > 0 && (
            <div className="mt-8 space-y-5">
              {[...product.additional_info].sort((a, b) => a.order - b.order).map((info) => (
                <div key={info.id} className="border-l-2 border-accent/50 pl-4">
                  <h2 className="font-display text-xl">{info.title}</h2>
                  <div className="mt-1 text-sm leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: info.description }} />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}

export default ProductDetailPage;
