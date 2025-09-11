// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores';

import LoginView from '@/views/LoginView.vue';
import BookshelfView from '@/views/BookshelfView.vue';
import LoginCallbackView from '@/views/LoginCallbackView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: '/login/callback',
    name: 'login-callback',
    component: LoginCallbackView,
    meta: { guestOnly: true }
  },
  {
    path: '/',
    name: 'books-list',
    component: BookshelfView
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // 스토어 초기화(새로고침 대비)
  if (!auth.accessToken && localStorage.getItem('auth.accessToken')) {
    auth.loadMe();
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'books-list' };
  }
  return true;
});

export default router;
