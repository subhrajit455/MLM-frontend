const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  getTree: (rootId = 'root', depth = 4, treeType = 'binary') =>
    request(`/tree/${rootId}?depth=${depth}&treeType=${treeType}`),

  getUsers: () => request('/users'),

  registerUser: (payload) =>
    request('/users/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  createOrder: (payload) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getOrders: () => request('/orders'),

  refundOrder: (orderId) =>
    request(`/orders/${orderId}/refund`, {
      method: 'POST'
    }),

  runBinarySettlement: (periodId = '202610') =>
    request('/settlement/run-binary', {
      method: 'POST',
      body: JSON.stringify({ periodId })
    }),

  getUserDashboard: (userId = 'root') => request(`/users/${userId}/dashboard`),

  seedDemoNetwork: () =>
    request('/seed', {
      method: 'POST'
    })
};

