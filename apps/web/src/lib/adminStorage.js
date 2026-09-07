const ADMIN_AUTH_KEY = 'samira-art-admin-auth';
const ADMIN_PRODUCTS_KEY = 'samira-art-admin-products';
const ADMIN_CATEGORIES_KEY = 'samira-art-admin-categories';
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12;

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'samiraart123',
};

const defaultCategories = [
  { value: 'embroideries', label: 'Embroideries' },
  { value: 'pearl-bracelets', label: 'Pearl Bracelets' },
];

const defaultProducts = [
  {
    id: 'seed-embroidered-ochre',
    title: 'Ochre Threadwork',
    subtitle: 'Hand embroidery on ivory linen',
    ribbon_text: 'Featured',
    description: '<p>A warm ochre composition stitched by hand in layered thread.</p>',
    image: 'https://images.hostinger.com/456853d1-0f29-4e21-8928-fea4bd8f7c4c.png',
    price_in_cents: 42000,
    currency: 'MAD',
    purchasable: true,
    order: 1,
    type: { value: 'embroideries' },
    variants: [
      {
        id: 'seed-embroidered-ochre-v1',
        title: 'Default',
        image_url: 'https://images.hostinger.com/456853d1-0f29-4e21-8928-fea4bd8f7c4c.png',
        sku: 'EMB-001',
        price_in_cents: 42000,
        sale_price_in_cents: null,
        currency: 'MAD',
        currency_info: { code: 'MAD', symbol: 'MAD ', template: '$1', decimal_digits: 2 },
        price_formatted: 'MAD 420.00',
        sale_price_formatted: null,
        manage_inventory: true,
        inventory_quantity: 4,
        weight: null,
        options: [],
      },
    ],
    images: [{ url: 'https://images.hostinger.com/456853d1-0f29-4e21-8928-fea4bd8f7c4c.png', order: 0, type: 'main' }],
    additional_info: [],
    collections: [],
    options: [],
  },
  {
    id: 'seed-pearl-bracelet',
    title: 'Pearl Field Bracelet',
    subtitle: 'Freshwater pearls on silk thread',
    ribbon_text: 'New',
    description: '<p>A graduated pearl bracelet finished with a warm, adjustable silk closure.</p>',
    image: 'https://images.hostinger.com/1add59e6-bf1d-472b-a784-79188959d46b.png',
    price_in_cents: 31000,
    currency: 'MAD',
    purchasable: true,
    order: 2,
    type: { value: 'pearl-bracelets' },
    variants: [
      {
        id: 'seed-pearl-bracelet-v1',
        title: 'Default',
        image_url: 'https://images.hostinger.com/1add59e6-bf1d-472b-a784-79188959d46b.png',
        sku: 'PEARL-001',
        price_in_cents: 31000,
        sale_price_in_cents: null,
        currency: 'MAD',
        currency_info: { code: 'MAD', symbol: 'MAD ', template: '$1', decimal_digits: 2 },
        price_formatted: 'MAD 310.00',
        sale_price_formatted: null,
        manage_inventory: true,
        inventory_quantity: 7,
        weight: null,
        options: [],
      },
    ],
    images: [{ url: 'https://images.hostinger.com/1add59e6-bf1d-472b-a784-79188959d46b.png', order: 0, type: 'main' }],
    additional_info: [],
    collections: [],
    options: [],
  },
];

const createSessionToken = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeAdminSession = (session) => {
  if (!session || !session.expiresAt) return null;
  if (Date.now() > Number(session.expiresAt)) {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    return null;
  }
  return session;
};

export const readAdminCategories = () => {
  try {
    const value = localStorage.getItem(ADMIN_CATEGORIES_KEY);
    if (!value) {
      localStorage.setItem(ADMIN_CATEGORIES_KEY, JSON.stringify(defaultCategories));
      return [...defaultCategories];
    }
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultCategories];
  } catch {
    return [...defaultCategories];
  }
};

export const writeAdminCategories = (categories) => {
  const next = Array.isArray(categories) && categories.length ? categories : [...defaultCategories];
  localStorage.setItem(ADMIN_CATEGORIES_KEY, JSON.stringify(next));
  return next;
};

export const readAdminProducts = () => {
  try {
    const value = localStorage.getItem(ADMIN_PRODUCTS_KEY);
    if (!value) {
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(defaultProducts));
      return [...defaultProducts];
    }
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultProducts];
  } catch {
    return [...defaultProducts];
  }
};

export const readAdminProductsIfAny = () => {
  try {
    const value = localStorage.getItem(ADMIN_PRODUCTS_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeAdminProducts = (products) => {
  const next = Array.isArray(products) ? products : [];
  localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(next));
  return next;
};

export const getAdminSession = () => {
  try {
    const value = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!value) return null;
    return normalizeAdminSession(JSON.parse(value));
  } catch {
    return null;
  }
};

export const isAdminAuthenticated = () => Boolean(getAdminSession());

export const loginAdmin = (username, password) => {
  const valid = username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
  if (!valid) return false;

  const session = {
    username: ADMIN_CREDENTIALS.username,
    token: createSessionToken(),
    expiresAt: String(Date.now() + ADMIN_SESSION_TTL_MS),
  };

  localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
  return true;
};

export const logoutAdmin = () => {
  localStorage.removeItem(ADMIN_AUTH_KEY);
};

export const createEmptyAdminProduct = () => ({
  id: `product-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  title: '',
  subtitle: '',
  ribbon_text: '',
  description: '<p>Describe this piece...</p>',
  image: '',
  price_in_cents: 0,
  currency: 'MAD',
  purchasable: true,
  order: 1,
  type: { value: 'embroideries' },
  variants: [
    {
      id: `variant-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      title: 'Default',
      image_url: '',
      sku: '',
      price_in_cents: 0,
      sale_price_in_cents: null,
      currency: 'MAD',
      currency_info: { code: 'MAD', symbol: 'MAD ', template: '$1', decimal_digits: 2 },
      price_formatted: 'MAD 0.00',
      sale_price_formatted: null,
      manage_inventory: true,
      inventory_quantity: 1,
      weight: null,
      options: [],
    },
  ],
  images: [],
  additional_info: [],
  collections: [],
  options: [],
});

export const normalizeAdminProduct = (input) => {
  const base = createEmptyAdminProduct();
  const parsed = input || {};
  const category = parsed.type?.value || parsed.category || 'embroideries';
  const variant = Array.isArray(parsed.variants) && parsed.variants[0]
    ? { ...base.variants[0], ...parsed.variants[0] }
    : base.variants[0];

  const safeImage = parsed.image || parsed.images?.[0]?.url || variant.image_url || '';

  return {
    ...base,
    ...parsed,
    id: parsed.id || base.id,
    title: parsed.title || '',
    subtitle: parsed.subtitle || '',
    ribbon_text: parsed.ribbon_text || '',
    description: parsed.description || '<p>Describe this piece...</p>',
    image: safeImage,
    price_in_cents: Number(parsed.price_in_cents ?? variant.price_in_cents ?? 0),
    currency: parsed.currency || 'MAD',
    purchasable: parsed.purchasable !== false,
    order: Number(parsed.order ?? 1),
    type: { value: category },
    variants: [
      {
        ...variant,
        id: variant.id || base.variants[0].id,
        title: variant.title || 'Default',
        image_url: safeImage,
        sku: variant.sku || '',
        price_in_cents: Number(variant.price_in_cents ?? parsed.price_in_cents ?? 0),
        sale_price_in_cents: variant.sale_price_in_cents ?? null,
        currency: variant.currency || parsed.currency || 'MAD',
        currency_info: variant.currency_info || { code: 'MAD', symbol: 'MAD ', template: '$1', decimal_digits: 2 },
        price_formatted: variant.price_formatted || 'MAD 0.00',
        sale_price_formatted: variant.sale_price_formatted ?? null,
        manage_inventory: variant.manage_inventory !== false,
        inventory_quantity: Number(variant.inventory_quantity ?? 1),
        weight: variant.weight ?? null,
        options: Array.isArray(variant.options) ? variant.options : [],
      },
    ],
    images: Array.isArray(parsed.images) && parsed.images.length
      ? parsed.images
      : safeImage ? [{ url: safeImage, order: 0, type: 'main' }] : [],
    additional_info: Array.isArray(parsed.additional_info) ? parsed.additional_info : [],
    collections: Array.isArray(parsed.collections) ? parsed.collections : [],
    options: Array.isArray(parsed.options) ? parsed.options : [],
  };
};
