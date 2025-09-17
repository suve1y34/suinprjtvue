import axios from 'axios';
import { ApiError } from '@/types/common';

/*
 * 기본: POST 사용
 * - 성공: 공통 래퍼({code,message,data})면 data만 반환
 * - 실패: ApiError로 변환
 */

function join(base?: string, prefix?: string) {
  const b = (base ?? '').toString().replace(/\/+$/, '');    // 끝 슬래시 제거
  let   p = (prefix ?? '').toString().replace(/^\/+/, '');  // 앞 슬래시 제거

  // /api 중복 방지 (예: BASE가 이미 .../api 로 끝나면 PREFIX가 /api 여도 붙이지 않음)
  if (b.endsWith('/api') && (p === '' || p === 'api')) p = '';

  if (!b && !p) return '/';
  return p ? `${b}/${p}` : (b || '/');
}

const RAW_BASE   = import.meta.env.VITE_API_BASE   as string | undefined;
const RAW_PREFIX = import.meta.env.VITE_API_PREFIX as string | undefined;

export const API_BASE = join(RAW_BASE, RAW_PREFIX);

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// ===== 토스트 디바운스(중복 방지) & 401 단일 처리 플래그 =====
let lastToastMsg = '';
let lastToastAt = 0;
let handling401 = false;

function toastOnce(message: string, gapMs = 1200) {
  const now = Date.now();
  if (message === lastToastMsg && now - lastToastAt < gapMs) return;
  lastToastMsg = message;
  lastToastAt = now;
  try {
    window.dispatchEvent(new CustomEvent('toast:error', { detail: { message } }));
  } catch {}
}

/* 요청 인터셉터: LS/SS 둘 다 확인 */
http.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('auth.accessToken') ??
    sessionStorage.getItem('auth.accessToken');
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

/* 응답 언래핑 + 에러 처리(401은 토스트 금지) */
http.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body === 'object' && ('data' in body) && ('code' in body || 'message' in body)) {
      return body.data;
    }
    return body;
  },
  (err) => {
    const res = err?.response;
    const body = res?.data;
    const status = res?.status;

    // 401: 단 한 번만 로그아웃 플로우 트리거, 토스트는 띄우지 않음
    if (status === 401) {
      if (!handling401) {
        handling401 = true;
        try {
          localStorage.removeItem('auth.accessToken');
          localStorage.removeItem('auth.user');
          sessionStorage.removeItem('auth.accessToken');
          sessionStorage.removeItem('auth.user');
        } catch {}
        try { window.dispatchEvent(new CustomEvent('auth:unauthorized')); } catch {}
        setTimeout(() => { handling401 = false; }, 1500);
      }
      const code = (body && typeof body === 'object' && 'code' in body) ? body.code : undefined;
      return Promise.reject(new ApiError('UNAUTHORIZED', { status, code, payload: body }));
    }

    // 그 외 오류: 디바운스 토스트 1회
    const message = body?.message || err?.message || '요청 중 오류가 발생했습니다.';
    toastOnce(message);

    const code = (body && typeof body === 'object' && 'code' in body) ? body.code : undefined;
    return Promise.reject(new ApiError(message, { status, code, payload: body }));
  }
);

async function get<T>(url: string, params?: Record<string, any>, config?: any): Promise<T> {
  const data = await http.get(url, { params, ...(config || {}) });
  return data as T;
}
async function post<T>(url: string, body?: unknown, params?: Record<string, any>, config?: any): Promise<T> {
  const data = await http.post(url, body ?? null, { params, ...(config || {}) });
  return data as T;
}
async function put<T>(url: string, body?: unknown, params?: Record<string, any>, config?: any): Promise<T> {
  const data = await http.put(url, body ?? null, { params, ...(config || {}) });
  return data as T;
}
async function patch<T>(url: string, body?: unknown, params?: Record<string, any>, config?: any): Promise<T> {
  const data = await http.patch(url, body ?? null, { params, ...(config || {}) });
  return data as T;
}
async function del<T>(url: string, params?: Record<string, any>, config?: any): Promise<T> {
  const data = await http.delete(url, { params, ...(config || {}) });
  return data as T;
}

export const apiClient = { get, post, put, patch, del };