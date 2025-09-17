// 안전 결합 유틸 (API 쪽은 필요 시 사용)
function join(base?: string, prefix?: string) {
  const b = (base ?? '').replace(/\/+$/, '');
  const p = (prefix ?? '').replace(/^\/+/, '');
  if (!b && !p) return '/';
  return p ? `${b}/${p}` : (b || '/');
}

// 환경값
const RAW_BASE   = import.meta.env.VITE_API_BASE   as string | undefined;
const RAW_PREFIX = import.meta.env.VITE_API_PREFIX as string | undefined;

// 예: http://ckk122.cafe24.com/api
export const API_BASE = join(RAW_BASE, RAW_PREFIX);

// ★ 해시 모드에서는 FE 기원(origin)만 정확하면 됨
export const FRONT_ORIGIN =
  (import.meta.env.VITE_FRONT_ORIGIN ?? window.location.origin) as string;

// OAuth 시작 endpoint (redirect_uri는 호출 시점에 붙임)
export const OAUTH2_AUTH_URL = {
  google: `${API_BASE}/oauth2/authorization/google`,
};