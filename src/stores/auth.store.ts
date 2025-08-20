import { defineStore } from 'pinia';
import { authApi } from '@/api/auth.api';

// 로컬 스토리지 키
const LS_TOKEN = 'auth.accessToken';
const LS_USER = 'auth.user';

type User = {
    userId: number;
    userName: string;
    email: string;
    nickname?: string;
} | null;

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

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User,
    accessToken: null as string | null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.accessToken && !!s.user,
  },
  actions: {
    async login(email: string, password: string) {
      const resp = await authApi.login({ email, password });
      this.accessToken = resp.accessToken;
      this.user = resp.user;

      // 영속화
      localStorage.setItem(LS_TOKEN, resp.accessToken);
      localStorage.setItem(LS_USER, JSON.stringify(resp.user));

      return resp.user;
    },

    async logout() {
      try { await authApi.logout(); } catch { }
      // 상태/스토리지 정리
      this.user = null;
      this.accessToken = null;
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_USER);
    },

    // 스토리지 - 메모리 로드 + 만료 체크
    loadMe() {
      const token = localStorage.getItem(LS_TOKEN);
      const userStr = localStorage.getItem(LS_USER);

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
  },
});