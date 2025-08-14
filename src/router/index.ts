// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'books-list',
    component: () => import('@/views/BookshelfView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
