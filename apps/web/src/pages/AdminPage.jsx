import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  createEmptyAdminProduct,
  normalizeAdminProduct,
  readAdminCategories,
} from '@/lib/adminStorage';
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  isAdminAuthenticatedApi,
  loginAdminApi,
  logoutAdminApi,
  updateAdminProduct,
} from '@/api/AdminApi';

export function ProtectedAdminRoute() {
  const authenticated = isAdminAuthenticatedApi();

  if (!authenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <AdminPage />;
}

const categoryOptions = readAdminCategories();

const emptyForm = (initialCategory = 'embroideries') => ({
  ...createEmptyAdminProduct(),
  type: { value: initialCategory },
  variants: [{
    ...createEmptyAdminProduct().variants[0],
    inventory_quantity: 1,
    title: 'Default',
    image_url: '',
    price_in_cents: 0,
  }],
});

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const valid = await onLogin(username, password);
    if (!valid) {
      setError('Invalid credentials.');
      return;
    }
    setError('');
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center justify-center px-5 py-16">
      <form onSubmit={handleSubmit} className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="eyebrow text-accent">Admin access</p>
        <h1 className="mt-4 font-display text-4xl">Sign in</h1>
        <div className="mt-8 space-y-5">
          <label className="block text-sm text-muted-foreground">
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full border border-border bg-background px-3 py-2 outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm text-muted-foreground">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full border border-border bg-background px-3 py-2 outline-none focus:border-accent"
            />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" className="w-full bg-foreground px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-background hover:bg-accent">
            Enter admin
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(isAdminAuthenticatedApi());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!authenticated) {
      setLoading(false);
      return undefined;
    }
    getAdminProducts()
      .then(setProducts)
      .catch((error) => setNotice(error.message))
      .finally(() => setLoading(false));
    return undefined;
  }, [authenticated]);

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + (product.variants?.[0]?.inventory_quantity || 0), 0),
    [products],
  );

  if (!authenticated) {
    return <AdminLogin onLogin={async (username, password) => {
      try {
        await loginAdminApi(username, password);
        setAuthenticated(true);
        return true;
      } catch {
        return false;
      }
    }} />;
  }

  if (loading) {
    return <div className="mx-auto w-full max-w-[1200px] px-5 py-16 text-sm text-muted-foreground">Loading products...</div>;
  }

  const handleFormChange = (field, value) => {
    setForm((current) => {
      const next = { ...current };
      if (field === 'category') {
        next.type = { value: value };
        return next;
      }
      if (field === 'price_in_cents') {
        next.price_in_cents = Number(value || 0);
        next.variants = [{
          ...next.variants[0],
          price_in_cents: Number(value || 0),
          currency: next.currency || 'MAD',
          inventory_quantity: Number(next.variants?.[0]?.inventory_quantity || 1),
        }];
        return next;
      }
      if (field === 'inventory_quantity') {
        next.variants = [{
          ...next.variants[0],
          inventory_quantity: Number(value || 0),
        }];
        return next;
      }
      next[field] = value;
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title?.trim()) {
      setNotice('Please add a product title before saving.');
      return;
    }

    const normalized = normalizeAdminProduct({
      ...form,
      title: form.title.trim(),
      subtitle: form.subtitle?.trim() || '',
      image: form.image || form.images?.[0]?.url || '',
      type: { value: form.type?.value || 'embroideries' },
      variants: [{
        ...(form.variants?.[0] || {}),
        title: 'Default',
        image_url: form.image || form.images?.[0]?.url || '',
        price_in_cents: Number(form.price_in_cents || 0),
        inventory_quantity: Number(form.variants?.[0]?.inventory_quantity || 1),
        manage_inventory: true,
      }],
    });

    try {
      const saved = editingId
        ? await updateAdminProduct(editingId, { ...normalized, id: editingId })
        : await createAdminProduct(normalized);
      setProducts((current) => editingId
        ? current.map((product) => (product.id === editingId ? saved : product))
        : [saved, ...current]);
      setNotice(editingId ? 'Product updated successfully.' : 'Product added successfully.');
      setForm(emptyForm(form.type?.value || 'embroideries'));
      setEditingId(null);
    } catch (error) {
      setNotice(error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      ...normalizeAdminProduct(product),
      type: { value: product.type?.value || product.category || 'embroideries' },
      variants: [{
        ...(product.variants?.[0] || {}),
        inventory_quantity: product.variants?.[0]?.inventory_quantity || 1,
        price_in_cents: product.price_in_cents || product.variants?.[0]?.price_in_cents || 0,
      }],
    });
    setNotice('Editing selected product.');
  };

  const handleDelete = async (productId) => {
    try {
      await deleteAdminProduct(productId);
      setProducts((current) => current.filter((product) => product.id !== productId));
      if (editingId === productId) {
        setEditingId(null);
        setForm(emptyForm());
      }
      setNotice('Product removed.');
    } catch (error) {
      setNotice(error.message);
    }
  };

  const handleLogout = () => {
    logoutAdminApi();
    setAuthenticated(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-accent">Admin dashboard</p>
          <h1 className="mt-2 font-display text-5xl">Manage collection</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="border border-border px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {products.length} items
          </span>
          <span className="border border-border px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {totalStock} stock
          </span>
          <button onClick={handleLogout} className="border border-border px-3 py-2 text-[11px] uppercase tracking-[0.18em] hover:border-accent hover:text-accent">
            Log out
          </button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">{editingId ? 'Edit product' : 'Add product'}</h2>
          {notice && <p className="mt-3 text-sm text-accent">{notice}</p>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm text-muted-foreground sm:col-span-2">
                Title
                <input
                  required
                  value={form.title || ''}
                  onChange={(event) => handleFormChange('title', event.target.value)}
                  className="mt-2 w-full border border-border bg-background px-3 py-2 outline-none focus:border-accent"
                />
              </label>

              <label className="block text-sm text-muted-foreground sm:col-span-2">
                Subtitle
                <input
                  value={form.subtitle || ''}
                  onChange={(event) => handleFormChange('subtitle', event.target.value)}
                  className="mt-2 w-full border border-border bg-background px-3 py-2 outline-none focus:border-accent"
                />
              </label>

              <label className="block text-sm text-muted-foreground">
                Category
                <select
                  value={form.type?.value || 'embroideries'}
                  onChange={(event) => handleFormChange('category', event.target.value)}
                  className="mt-2 w-full border border-border bg-background px-3 py-2 outline-none focus:border-accent"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-muted-foreground">
                Price (MAD)
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={Math.round((form.price_in_cents || form.variants?.[0]?.price_in_cents || 0) / 100)}
                  onChange={(event) => handleFormChange('price_in_cents', Number(event.target.value) * 100)}
                  className="mt-2 w-full border border-border bg-background px-3 py-2 outline-none focus:border-accent"
                />
              </label>

              <label className="block text-sm text-muted-foreground">
                Stock
                <input
                  type="number"
                  min="0"
                  value={form.variants?.[0]?.inventory_quantity || 1}
                  onChange={(event) => handleFormChange('inventory_quantity', Number(event.target.value || 0))}
                  className="mt-2 w-full border border-border bg-background px-3 py-2 outline-none focus:border-accent"
                />
              </label>

              <label className="block text-sm text-muted-foreground sm:col-span-2">
                Image URL
                <input
                  value={form.image || ''}
                  onChange={(event) => handleFormChange('image', event.target.value)}
                  className="mt-2 w-full border border-border bg-background px-3 py-2 outline-none focus:border-accent"
                />
              </label>

              {form.image && (
                <div className="sm:col-span-2">
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Preview</p>
                  <img src={form.image} alt="Product preview" className="h-44 w-full object-cover border border-border" />
                </div>
              )}

              <label className="block text-sm text-muted-foreground sm:col-span-2">
                Description
                <textarea
                  rows="4"
                  value={form.description || ''}
                  onChange={(event) => handleFormChange('description', event.target.value)}
                  className="mt-2 w-full border border-border bg-background px-3 py-2 outline-none focus:border-accent"
                />
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" className="bg-foreground px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-background hover:bg-accent">
                {editingId ? 'Save changes' : 'Add product'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm(form.type?.value || 'embroideries'));
                    setNotice('Edit cancelled.');
                  }}
                  className="border border-border px-5 py-3 text-[11px] uppercase tracking-[0.18em] hover:border-accent hover:text-accent"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Current products</h2>
          <div className="mt-6 space-y-4">
            {products.map((product) => (
              <div key={product.id} className="rounded-xl border border-border bg-background p-3">
                <div className="flex gap-3">
                  <img src={product.image || '/placeholder.png'} alt={product.title} className="h-16 w-16 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg leading-tight">{product.title}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{product.type?.value || 'embroideries'}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{product.variants?.[0]?.inventory_quantity || 0} in stock</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleEdit(product)} className="flex-1 border border-border px-3 py-2 text-[10px] uppercase tracking-[0.16em] hover:border-accent hover:text-accent">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="flex-1 border border-border px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-destructive hover:border-destructive hover:text-destructive">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link to="/" className="eyebrow inline-block border-b border-accent pb-1 text-accent">Back to storefront</Link>
      </div>
    </div>
  );
}

export default AdminPage;
