import { defineStore } from 'pinia';
import { api } from '@/api';
import type { User, UserUpdatePayload, LoginOptions } from "@/types/user";

// 로컬 스토리지 키
const LS_TOKEN = 'auth.accessToken';
const LS_USER = 'auth.user';

function parseJwtExp(token: string): number | null {
    try {
        const base64 = token.split('.')[1];
        const json = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
        return typeof json.exp === 'number' ? json.exp : null;
    } catch { return null; }
}

function isExpired(token: string, leewaySec = 30): boolean {
  const exp = parseJwtExp(token);
  if (!exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp - now <= leewaySec;
}

function getStore(remember?: boolean) {
  return remember ? window.localStorage : window.sessionStorage;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    accessToken: null as string | null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.accessToken && !!s.user,
  },
  actions: {
    async login(email: string, password: string, opts?: LoginOptions) {
      const resp = await api.auth.login({ email, password });
      this.accessToken = resp.accessToken;
      this.user = resp.user;

      // 저장 전에 양쪽 스토리지 정리(중복 방지)
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_USER);
      sessionStorage.removeItem(LS_TOKEN);
      sessionStorage.removeItem(LS_USER);

      // 영속화
      const store = getStore(opts?.remember ?? true);
      store.setItem(LS_TOKEN, resp.accessToken);
      store.setItem(LS_USER, JSON.stringify(resp.user));

      return resp.user;
    },

    async logout() {
      try { await api.auth.logout(); } catch { }
      // 상태/스토리지 정리
      this.user = null;
      this.accessToken = null;
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_USER);
      sessionStorage.removeItem(LS_TOKEN);
      sessionStorage.removeItem(LS_USER);
    },

    // 스토리지 - 메모리 로드 + 만료 체크
    loadMe() {
      const token = localStorage.getItem(LS_TOKEN) ?? sessionStorage.getItem(LS_TOKEN);
      const userStr = localStorage.getItem(LS_USER) ?? sessionStorage.getItem(LS_USER);

      if (!token || !userStr) {
        this.user = null; this.accessToken = null;
        return;
      }
      if (isExpired(token)) {
        // 만료
        this.logout();
        return;
      }
      try {
        this.accessToken = token;
        this.user = JSON.parse(userStr) as NonNullable<User>;
      } catch {
        this.logout();
      }
    },

    async updateMe(payload: UserUpdatePayload) {
      const updated = await api.users.updateMe(payload);
      // 스토어 갱신
      this.user = this.user
        ? { ...this.user, userName: updated.userName, nickname: updated.nickname, email: updated.email }
        : updated;

      // 저장된 토큰이 있는 저장소에만 사용자 정보 반영
      const userStr = JSON.stringify(this.user);
      if (localStorage.getItem('auth.accessToken')) localStorage.setItem('auth.user', userStr);
      if (sessionStorage.getItem('auth.accessToken')) sessionStorage.setItem('auth.user', userStr);

      return this.user;
    },
  },
});