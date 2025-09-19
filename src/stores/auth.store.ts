import { defineStore } from 'pinia';
import { api } from '@/api';
import type { User, UserUpdatePayload, GoalProgress } from "@/types/user";
import { isExpired } from '@/utils/jwt';

// 로컬 스토리지 키
const LS_TOKEN = 'auth.accessToken';
const LS_USER = 'auth.user';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    accessToken: null as string | null,
    goalProgress: null as GoalProgress | null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.accessToken && !!s.user,
  },
  actions: {
    async loginByToken(token: string) {
      this.accessToken = token;

      // 토큰을 스토리지에 먼저 저장
      localStorage.setItem(LS_TOKEN, token);
      sessionStorage.setItem(LS_TOKEN, token);

      try {
        const me = await api.users.getMe(); // /api/users/me
        this.user = me;
        const userStr = JSON.stringify(this.user);
        localStorage.setItem(LS_USER, userStr);
        sessionStorage.setItem(LS_USER, userStr);
      } catch (e) {
        console.error('SNS 로그인 후 사용자 정보 불러오기 실패', e);
        this.logout();
        throw e;
      }
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

    async fetchGoalProgress() {
      const gp = await api.users.goalProgress();
      this.goalProgress = gp;
      return gp;
    },

    async fetchMe(force = false) {
      // 이미 user가 있고 강제 갱신이 아니면 반환
      if (this.user && !force) return this.user;

      // 캐시 무효화를 위해 timestamp 파라미터 추가
      const me = await api.users.getMe();
      this.user = me;

      // 저장된 토큰이 있는 저장소에만 사용자 정보 반영
      const userStr = JSON.stringify(this.user);
      if (localStorage.getItem('auth.accessToken')) localStorage.setItem('auth.user', userStr);
      if (sessionStorage.getItem('auth.accessToken')) sessionStorage.setItem('auth.user', userStr);

      return this.user;
    },

    async updateMe(payload: UserUpdatePayload) {
      const updated = await api.users.updateMe(payload);
      // 스토어 갱신
      this.user = this.user
      ? { 
          ...this.user,
          userName: updated.userName,
          nickname: updated.nickname,
          email: updated.email,
          userPhone: updated.userPhone,
          goalYearlyCount: updated.goalYearlyCount,
        }
      : updated;

      // 저장된 토큰이 있는 저장소에만 사용자 정보 반영
      const userStr = JSON.stringify(this.user);
      if (localStorage.getItem('auth.accessToken')) localStorage.setItem('auth.user', userStr);
      if (sessionStorage.getItem('auth.accessToken')) sessionStorage.setItem('auth.user', userStr);

      return this.user;
    },
  },
});