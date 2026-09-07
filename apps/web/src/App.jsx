import React from 'react';
import { Route, Routes, BrowserRouter as Router, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import { CartProvider } from './hooks/useCart';
import { LanguageProvider, useLang } from './i18n/LanguageProvider';
import { Toaster } from '@/components/ui/toaster';
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import ArtworkDetailPage from './pages/ArtworkDetailPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FaqPage from './pages/FaqPage';
import CartPage from './pages/CartPage';
import OrderConfirmedPage from './pages/OrderConfirmedPage';
import LegalPage from './pages/LegalPage';
import AdminPage, { ProtectedAdminRoute } from './pages/AdminPage';

const NotFoundPage = () => {
  const { t } = useLang();
  return (
    <section className="mx-auto max-w-2xl px-5 py-32 text-center">
      <Helmet>
        <title>{t('notfound.eyebrow')} — Samira Art</title>
        <meta name="description" content={t('notfound.text')} />
      </Helmet>
      <p className="eyebrow text-accent">{t('notfound.eyebrow')}</p>
      <h1 className="mt-4 font-display text-5xl">{t('notfound.title')}</h1>
      <p className="mt-4 text-sm text-muted-foreground">{t('notfound.text')}</p>
      <Link to="/" className="eyebrow mt-8 inline-block border-b border-accent pb-1 text-accent">
        {t('notfound.cta')}
      </Link>
    </section>
  );
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/portfolio/:slug" element={<ArtworkDetailPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/order-confirmed" element={<OrderConfirmedPage />} />
              <Route path="/privacy" element={<LegalPage page="privacy" />} />
              <Route path="/terms" element={<LegalPage page="terms" />} />
              <Route path="/returns" element={<LegalPage page="returns" />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/secure" element={<ProtectedAdminRoute />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          <Toaster />
        </CartProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
