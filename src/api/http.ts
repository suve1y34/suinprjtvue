import axios from 'axios';
import { ApiError } from '@/types/common';

/*
 * 기본: POST 사용
 * - 성공: 공통 래퍼({code,message,data})면 data만 반환
 * - 실패: ApiError로 변환
 */

const BASE = import.meta.env.VITE_API_BASE ?? "";
const PREFIX = import.meta.env.VITE_API_PREFIX ?? "/api";

export const http = axios.create({
  baseURL: `${BASE}${PREFIX}`.replace(/\/+$/, ""),
  timeout: 10000,
});

// 요청 인터셉터
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth.accessToken');
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 언래핑 + 401 처리
http.interceptors.response.use(
  (res) => {
    const body = res.data;
    // 공통 래퍼 형태면 data만 반환
    if (body && typeof body === 'object' && ('data' in body) && ('code' in body || 'message' in body)) {
      return body.data;
    }
    // 래퍼가 아니면 원본 data 반환
    return body;
  },
  (err) => {
    const res = err?.response;
    const body = res?.data;
    const status = res?.status;

    // 401 처리: 로그아웃
    if (status === 401) {
      try {
        localStorage.removeItem('auth.accessToken');
        localStorage.removeItem('auth.user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      } catch {}
    }

    const message =
      body?.message ||
      err?.message ||
      '요청 중 오류가 발생했습니다.';

    const code = (body && typeof body === 'object' && 'code' in body) ? body.code : undefined;

    try {
      window.dispatchEvent(new CustomEvent('toast:error', { detail: { message } }));
    } catch {}
    
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