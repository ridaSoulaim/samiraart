import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ShoppingCart from '@/components/ShoppingCart';

const Layout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader onOpenCart={() => setIsCartOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </div>
  );
};

export default Layout;
