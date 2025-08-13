import axios from 'axios';
import { ApiError } from '@/types/common';

/*
 * 기본: POST 사용
 * - 성공: 공통 래퍼({code,message,data})면 data만 반환
 * - 실패: ApiError로 변환
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 10000,
});

// 응답 언래핑
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
    const message =
      body?.message ||
      err?.message ||
      '요청 중 오류가 발생했습니다.';

    // 서버가 공통 래퍼 형태로 에러 반환한 경우
    const code = (body && typeof body === 'object' && 'code' in body) ? body.code : undefined;
    return Promise.reject(new ApiError(message, { status: res?.status, code, payload: body }));
  }
);

// 기본 POST 전용 클라이언트
async function post<T>(
  url: string,
  body?: unknown,
  params?: Record<string, any>,
  config?: any
): Promise<T> {
  const data = await http.post(url, body ?? null, { params, ...(config || {}) });
  return data as T;
}

// 필요 시 확장용(추가 메서드가 생기면 여기..)
export const apiClient = { post };
