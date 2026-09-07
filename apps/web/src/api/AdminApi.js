const ADMIN_TOKEN_KEY = 'samira-art-admin-token';

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error || 'Admin API request failed');
  return body;
};

export const getAdminToken = () => sessionStorage.getItem(ADMIN_TOKEN_KEY);

export const loginAdminApi = async (username, password) => {
  const result = await request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  sessionStorage.setItem(ADMIN_TOKEN_KEY, result.token);
  return result;
};

export const logoutAdminApi = () => sessionStorage.removeItem(ADMIN_TOKEN_KEY);

export const isAdminAuthenticatedApi = () => Boolean(getAdminToken());

export const getAdminProducts = async () => (await request('/api/products')).products;

export const createAdminProduct = async (product) => request('/api/products', {
  method: 'POST',
  body: JSON.stringify(product),
});

export const updateAdminProduct = async (id, product) => request(`/api/products/${encodeURIComponent(id)}`, {
  method: 'PUT',
  body: JSON.stringify(product),
});

export const deleteAdminProduct = async (id) => request(`/api/products/${encodeURIComponent(id)}`, {
  method: 'DELETE',
});