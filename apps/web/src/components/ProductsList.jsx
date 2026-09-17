import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { useLang } from '@/i18n/LanguageProvider';
import { getProducts, getProductQuantities } from '@/api/EcommerceApi';
import { readAdminProductsIfAny } from '@/lib/adminStorage';
import { getAdminProducts } from '@/api/AdminApi';

const placeholderImage =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRUZFN0RCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzlBOEU3RSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlN0dWRpbyBwaWVjZTwvdGV4dD48L3N2Zz4=";

/** Fetches published products and merges live inventory quantities. */
export const useStoreProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const useLocalProducts = (localProducts) => {
      if (!localProducts.length) return false;
      const normalized = localProducts.map((product) => ({
        ...product,
        id: product.id,
        title: product.title,
        subtitle: product.subtitle,
        ribbon_text: product.ribbon_text,
        description: product.description,
        image: product.image || product.images?.[0]?.url || '',
        price_in_cents: Number(product.price_in_cents ?? product.variants?.[0]?.price_in_cents ?? 0),
        currency: product.currency || 'MAD',
        purchasable: product.purchasable !== false,
        order: Number(product.order ?? 0),
        images: Array.isArray(product.images) && product.images.length ? product.images : (product.image ? [{ url: product.image, order: 0, type: 'main' }] : []),
        additional_info: Array.isArray(product.additional_info) ? product.additional_info : [],
        collections: Array.isArray(product.collections) ? product.collections : [],
        options: Array.isArray(product.options) ? product.options : [],
        variants: Array.isArray(product.variants) && product.variants.length ? product.variants.map((variant) => {
          const price = Number(variant.price_in_cents ?? product.price_in_cents ?? 0);
          return {
            ...variant,
            inventory_quantity: Number(variant.inventory_quantity ?? 1),
            price_in_cents: price,
            price_formatted: variant.price_formatted || `MAD ${(price / 100).toFixed(2)}`,
            image_url: variant.image_url || product.image || '',
          };
        }) : [{
          id: `${product.id}-default`,
          title: 'Default',
          image_url: product.image || '',
          sku: '',
          price_in_cents: Number(product.price_in_cents ?? 0),
          sale_price_in_cents: null,
          currency: product.currency || 'MAD',
          currency_info: { code: 'MAD', symbol: 'MAD ', template: '$1', decimal_digits: 2 },
          price_formatted: 'MAD 0.00',
          sale_price_formatted: null,
          manage_inventory: true,
          inventory_quantity: 1,
          weight: null,
          options: [],
        }],
      }));
      if (active) {
        setProducts(normalized);
        setLoading(false);
        setError(null);
      }
      return true;
    };

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const databaseProducts = await getAdminProducts();
        if (databaseProducts.length && useLocalProducts(databaseProducts)) return;
        const response = await getProducts();
        if (!response.products.length) {
          if (active) setProducts([]);
          return;
        }
        const quantities = await getProductQuantities({
          fields: 'inventory_quantity',
          product_ids: response.products.map((p) => p.id),
        });
        const map = new Map(quantities.variants.map((v) => [v.id, v.inventory_quantity]));
        const merged = response.products.map((product) => ({
          ...product,
          variants: product.variants.map((v) => ({
            ...v,
            inventory_quantity: map.get(v.id) ?? v.inventory_quantity,
          })),
        }));
        if (active) setProducts(merged);
      } catch (err) {
        if (active) setError(err.message || 'Failed to load the collection');
      } finally {
        if (active) setLoading(false);
      }
    };
    const localProducts = readAdminProductsIfAny();
    run().catch(() => useLocalProducts(localProducts));
    return () => { active = false; };
  }, []);

  return { products, loading, error };
};

export const isSoldOut = (product) => {
  const variants = product.variants || [];
  if (!variants.length) return true;
  return variants.every((v) => v.manage_inventory && (v.inventory_quantity ?? 0) <= 0);
};

export const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { t } = useLang();
  const navigate = useNavigate();

  const displayVariant = useMemo(() => product.variants?.[0], [product]);
  const hasSale = Boolean(displayVariant?.sale_price_in_cents);
  const displayPrice = hasSale ? displayVariant.sale_price_formatted : displayVariant?.price_formatted;
  const originalPrice = hasSale ? displayVariant.price_formatted : null;
  const soldOut = isSoldOut(product);

  const handleAddToCart = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!product.variants?.length) return;
      if (product.variants.length > 1) {
        navigate(`/product/${product.id}`);
        return;
      }
      const variant = product.variants[0];
      try {
        await addToCart(product, variant, 1, variant.inventory_quantity);
        toast({ title: t('pl.toastAddedTitle'), description: product.title });
      } catch (error) {
        toast({ title: t('pl.toastFailTitle'), description: error.message, variant: 'destructive' });
      }
    },
    [product, addToCart, toast, navigate, t],
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: Math.min(index, 6) * 0.05 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-secondary">
          <img
            src={product.image || placeholderImage}
            alt={`${product.title} by Samira Art`}
            loading="lazy"
            className="h-[22rem] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] sm:h-[26rem]"
          />
          {product.ribbon_text && (
            <span className="absolute left-4 top-4 bg-background/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
              {product.ribbon_text}
            </span>
          )}
          {soldOut && (
            <span className="absolute left-4 top-4 bg-foreground/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-background">
              {t('pl.sold')}
            </span>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-4 pt-4">
          <h3 className="font-display text-xl leading-snug">{product.title}</h3>
          <p className="whitespace-nowrap text-sm">
            {hasSale && <span className="mr-2 text-muted-foreground line-through">{originalPrice}</span>}
            {displayPrice}
          </p>
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
          {product.subtitle || t('product.placeholderSubtitle')}
        </p>
      </Link>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={soldOut || !product.purchasable}
        className="mt-3 w-full border border-foreground/25 py-3 text-[11px] uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent active:scale-[0.99] disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:text-muted-foreground"
      >
        {soldOut ? t('pl.soldOut') : product.variants?.length > 1 ? t('pl.chooseOptions') : t('pl.addToCart')}
      </button>
    </motion.article>
  );
};

export const ProductGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-[22rem] w-full bg-secondary sm:h-[26rem]" />
        <div className="mt-4 h-4 w-2/3 bg-secondary" />
        <div className="mt-2 h-3 w-1/3 bg-secondary" />
      </div>
    ))}
  </div>
);

const ProductsList = ({ limit }) => {
  const { t } = useLang();
  const { products, loading, error } = useStoreProducts();

  if (loading) return <ProductGridSkeleton count={limit || 3} />;

  if (error) {
    return (
      <p className="border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {t('pl.error', { msg: error })}
      </p>
    );
  }

  if (!products.length) {
    return (
      <p className="border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {t('pl.empty')}
      </p>
    );
  }

  const shown = limit ? products.slice(0, limit) : products;

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
};

export default ProductsList;
