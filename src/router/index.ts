// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores';

import LoginView from '@/views/LoginView.vue';
import BookshelfView from '@/views/BookshelfView.vue';
import LoginCallbackView from '@/views/LoginCallbackView.vue';

const routes: RouteRecordRaw[] = [
  // 게스트 전용
  { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
  { path: '/login/callback', name: 'login-callback', component: LoginCallbackView, meta: { guestOnly: true } },

  // 메인: 인증 필요
  { path: '/', name: 'books-list', component: BookshelfView, meta: { requiresAuth: true } },

  // /login 하위 오타/변형 → /login 고정
  { path: '/login/:rest(.*)*', redirect: { name: 'login' } },

  // 정의 외 모든 경로 → /login 고정
  { path: '/:pathMatch(.*)*', redirect: { name: 'login' } },
];


const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // 새로고침 대비: 스토리지-메모리 동기화
  if (!auth.accessToken && (localStorage.getItem('auth.accessToken') || sessionStorage.getItem('auth.accessToken'))) {
    auth.loadMe();
  }

  // 인증 필요 라우트인데 미로그인 - /login
  if (to.meta?.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  // 게스트 전용 라우트인데 이미 로그인 - 메인으로
  if (to.meta?.guestOnly && auth.isAuthenticated) {
    return { name: 'books-list' };
  }
  return true;
});

// ===== 401 전역 처리: 한 번만 실행 =====
let unauthOnce = false;
window.addEventListener('auth:unauthorized', async () => {
  if (unauthOnce) return;
  unauthOnce = true;

  const auth = useAuthStore();
  try {
    await auth.logout(); // 토큰/유저 정리
  } catch (_) {}
  // 로그인 화면으로 이동 (현재 로그인 화면이면 그대로)
  if (router.currentRoute.value.name !== 'login') {
    router.replace({ name: 'login' });
  }
  // 잠시 뒤 다시 허용(이후 401이 또 나면 한 번 더 반응)
  setTimeout(() => { unauthOnce = false; }, 1500);
});

export default router;
