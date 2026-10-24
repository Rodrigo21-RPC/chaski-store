export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error ?? 'Ocurrió un error. Intenta de nuevo.');
    this.status = status;
    this.body = body;
  }
}

// Envoltorio de fetch: devuelve el JSON (o null si no hay cuerpo) o lanza ApiError.
export async function request(path, options = {}) {
  const { json, ...rest } = options;
  const init = { ...rest };
  if (json !== undefined) {
    init.body = JSON.stringify(json);
    init.headers = { 'Content-Type': 'application/json', ...init.headers };
  }
  const res = await fetch(path, init);
  let body = null;
  if (res.status !== 204) {
    try {
      body = await res.json();
    } catch {
      body = null;
    }
  }
  if (!res.ok) throw new ApiError(res.status, body);
  return body;
}

export const getProduct = (id) => request(`/api/products/${id}`);

export const getConfig = () => request('/api/config');

export const login = (password) => request('/api/admin/login', { method: 'POST', json: { password } });

export const logout = () => request('/api/admin/logout', { method: 'POST' });

export const getSession = () => request('/api/admin/session');

// FormData viaja como multipart; ante un 400 el ApiError trae body.errors (un mensaje por campo).
export const createProduct = (formData) => request('/api/admin/products', { method: 'POST', body: formData });

export const deleteProduct = (id) => request(`/api/admin/products/${id}`, { method: 'DELETE' });
