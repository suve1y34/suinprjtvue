export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export const OAUTH2_AUTH_URL = {
  google: `${API_BASE}/oauth2/authorization/google`,
};