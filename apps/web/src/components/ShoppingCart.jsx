import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, X, Minus, Plus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useLang } from '@/i18n/LanguageProvider';

const ShoppingCart = ({ isCartOpen, setIsCartOpen }) => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { t } = useLang();
  const close = () => setIsCartOpen(false);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px]"
          onClick={close}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="font-display text-2xl">{t('sc.title')}</h2>
              <button onClick={close} aria-label={t('sc.close')} className="p-2 text-foreground/70 hover:text-accent">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                  <ShoppingBag size={38} strokeWidth={1} />
                  <p className="mt-4 text-sm">{t('sc.empty')}</p>
                  <Link to="/shop" onClick={close} className="eyebrow mt-6 border-b border-accent pb-1 text-accent">
                    {t('sc.browse')}
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.variant.id} className="flex gap-4">
                    <img src={item.variant.image_url || item.product.image} alt={item.product.title} className="h-24 w-20 shrink-0 object-cover" />
                    <div className="flex-1">
                      <p className="font-display text-lg leading-tight">{item.product.title}</p>
                      {item.variant.title && item.variant.title !== 'Default' && (
                        <p className="text-xs text-muted-foreground">{item.variant.title}</p>
                      )}
                      <p className="mt-1 text-sm">{item.variant.sale_price_formatted || item.variant.price_formatted}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center border border-border">
                          <button aria-label={t('sc.decrease')} className="px-2 py-1 hover:text-accent" onClick={() => updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))}>
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button aria-label={t('sc.increase')} className="px-2 py-1 hover:text-accent" onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}>
                            <Plus size={13} />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.variant.id)} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-destructive">
                          {t('sc.remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-border px-6 py-6">
                <div className="flex items-baseline justify-between">
                  <span className="eyebrow text-muted-foreground">{t('sc.subtotal')}</span>
                  <span className="font-display text-2xl">{getCartTotal()}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t('sc.shippingNote')}</p>
                <Link to="/cart" onClick={close} className="mt-5 block bg-foreground py-4 text-center text-[11px] uppercase tracking-[0.2em] text-background transition-colors hover:bg-accent active:scale-[0.99]">
                  {t('sc.review')}
                </Link>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShoppingCart;
