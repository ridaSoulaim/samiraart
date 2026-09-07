import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Minus, Plus, Loader2, Lock } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { useLang } from '@/i18n/LanguageProvider';
import { initializeCheckout } from '@/api/EcommerceApi';
import { SITE } from '@/data/site';

const field =
  'h-12 w-full border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-accent';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const { t } = useLang();
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState({ name: '', email: '', address: '', city: '', postcode: '', country: '', notes: '' });

  const set = (k) => (e) => setDetails((d) => ({ ...d, [k]: e.target.value }));

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cartItems.length) return;
    if (!details.name.trim() || !details.email.includes('@') || !details.address.trim() || !details.city.trim() || !details.country.trim()) {
      toast({ title: t('cart.toastCompleteTitle'), description: t('cart.toastCompleteDesc'), variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { url } = await initializeCheckout({
        items: cartItems.map((i) => ({ variant_id: i.variant.id, quantity: i.quantity })),
        successUrl: `${window.location.origin}/order-confirmed`,
        cancelUrl: window.location.href,
      });
      clearCart();
      window.location.href = url;
    } catch (err) {
      toast({ title: t('cart.toastCheckoutTitle'), description: t('cart.toastCheckoutDesc'), variant: 'destructive' });
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('cart.seoTitle')}</title>
        <meta name="description" content={t('cart.seoDesc')} />
        <link rel="canonical" href={`${SITE.url}/cart`} />
      </Helmet>

      <section className="mx-auto w-full max-w-[72rem] px-5 pt-20 sm:px-8 sm:pt-28">
        <p className="eyebrow text-accent">{t('cart.eyebrow')}</p>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl">{t('cart.title')}</h1>
      </section>

      {cartItems.length === 0 ? (
        <section className="mx-auto w-full max-w-[72rem] px-5 py-24 sm:px-8">
          <div className="border border-border bg-card px-6 py-20 text-center">
            <p className="font-display text-2xl">{t('cart.emptyTitle')}</p>
            <p className="mt-3 text-sm text-muted-foreground">{t('cart.emptyText')}</p>
            <Link to="/shop" className="mt-8 inline-block bg-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-background hover:bg-accent">
              {t('cart.browseCta')}
            </Link>
          </div>
        </section>
      ) : (
        <form onSubmit={handleCheckout} className="mx-auto grid w-full max-w-[72rem] gap-14 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-2xl">{t('cart.yourDetails')}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="eyebrow text-muted-foreground">{t('cart.fullName')}</label>
                <input id="name" className={`${field} mt-2`} value={details.name} onChange={set('name')} required />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className="eyebrow text-muted-foreground">{t('cart.email')}</label>
                <input id="email" type="email" className={`${field} mt-2`} value={details.email} onChange={set('email')} required />
              </div>
            </div>

            <h2 className="mt-12 font-display text-2xl">{t('cart.shippingAddress')}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="address" className="eyebrow text-muted-foreground">{t('cart.street')}</label>
                <input id="address" className={`${field} mt-2`} value={details.address} onChange={set('address')} required />
              </div>
              <div>
                <label htmlFor="city" className="eyebrow text-muted-foreground">{t('cart.city')}</label>
                <input id="city" className={`${field} mt-2`} value={details.city} onChange={set('city')} required />
              </div>
              <div>
                <label htmlFor="postcode" className="eyebrow text-muted-foreground">{t('cart.postcode')}</label>
                <input id="postcode" className={`${field} mt-2`} value={details.postcode} onChange={set('postcode')} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="country" className="eyebrow text-muted-foreground">{t('cart.country')}</label>
                <input id="country" className={`${field} mt-2`} value={details.country} onChange={set('country')} required />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="eyebrow text-muted-foreground">{t('cart.deliveryNotes')}</label>
                <textarea id="notes" rows={3} className="mt-2 w-full border border-border bg-background p-3 text-sm outline-none focus:border-accent" value={details.notes} onChange={set('notes')} />
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t('cart.paymentNote')}</p>
          </div>

          <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-2xl">{t('cart.orderSummary')}</h2>
            <ul className="mt-6 divide-y divide-border">
              {cartItems.map((item) => (
                <li key={item.variant.id} className="flex gap-4 py-4">
                  <img src={item.variant.image_url || item.product.image} alt={item.product.title} className="h-24 w-20 shrink-0 object-cover" />
                  <div className="flex-1">
                    <p className="font-display text-lg leading-tight">{item.product.title}</p>
                    {item.variant.title && item.variant.title !== 'Default' && (
                      <p className="text-xs text-muted-foreground">{item.variant.title}</p>
                    )}
                    <p className="mt-1 text-sm">{item.variant.sale_price_formatted || item.variant.price_formatted}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center border border-border">
                        <button type="button" aria-label={t('cart.decrease')} className="px-2 py-1 hover:text-accent" onClick={() => updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))}>
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button type="button" aria-label={t('cart.increase')} className="px-2 py-1 hover:text-accent" onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}>
                          <Plus size={13} />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.variant.id)} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-destructive">
                        {t('cart.remove')}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{t('cart.subtotal')}</span>
                <span>{getCartTotal()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t('cart.shipping')}</span>
                <span>{t('cart.shippingValue')}</span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <span className="eyebrow">{t('cart.total')}</span>
                <span className="font-display text-2xl">{getCartTotal()}</span>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 bg-foreground text-[11px] uppercase tracking-[0.2em] text-background transition-colors hover:bg-accent active:scale-[0.99] disabled:opacity-60">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={14} strokeWidth={1.6} />}
              {submitting ? t('cart.preparing') : t('cart.continuePayment')}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">{t('cart.secureNote')}</p>
          </aside>
        </form>
      )}
    </>
  );
};

export default CartPage;
