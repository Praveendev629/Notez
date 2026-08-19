const BASE = '/api';

async function request(path, { method = 'GET', body } = {}) {
  const opts = {
    method,
    headers: {},
    credentials: 'include',
  };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(BASE + path, opts);
  } catch (err) {
    throw new Error('Network error. Check your connection and try again.');
  }
  let json = {};
  try {
    json = await res.json();
  } catch (_) {
    /* empty body */
  }
  if (!res.ok) {
    const error = new Error(json.error || 'Request failed');
    error.status = res.status;
    throw error;
  }
  return json;
}

const realApi = {
  register: (d) => request('/auth/register', { method: 'POST', body: d }),
  login: (d) => request('/auth/login', { method: 'POST', body: d }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  notes: (params = {}) =>
    request('/notes?' + new URLSearchParams(params).toString()),
  note: (id) => request(`/notes/${id}`),
  createNote: (d) => request('/notes', { method: 'POST', body: d }),
  updateNote: (id, d) => request(`/notes/${id}`, { method: 'PUT', body: d }),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
  setPin: (id, isPinned) =>
    request(`/notes/${id}/pin`, { method: 'PATCH', body: { isPinned } }),
  setArchive: (id, isArchived) =>
    request(`/notes/${id}/archive`, { method: 'PATCH', body: { isArchived } }),
  search: (q) => request(`/notes/search?q=${encodeURIComponent(q)}`),

  // Upload an image file to the server, which stores it in Cloudinary.
  async uploadImage(file) {
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Upload failed');
    return json;
  },
};

// Notez runs against the real backend (Express + MongoDB). No mock layer.
export const api = realApi;