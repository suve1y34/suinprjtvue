import { defineStore } from 'pinia';
import type { Book } from '@/types/book';
import { api } from '@/api';
import { ApiError } from '@/types/common';

export const useBooksStore = defineStore('books', {
  state: () => ({
    items: [] as Book[],
    selected: null as Book | null,
    loadingList: false,
    loadingDetail: false,
    error: null as string | null,
  }),
  actions: {
    async fetchList() {
      this.loadingList = true; this.error = null;
      try {
        this.items = await api.books.list();
      } catch (e: any) {
        this.error = e instanceof ApiError ? e.message : (e?.message ?? '목록 조회 실패');
        throw e;
      } finally {
        this.loadingList = false;
      }
    },
    async fetchDetail(bookId: number) {
      this.loadingDetail = true; this.error = null;
      try {
        this.selected = await api.books.detail(bookId);
      } catch (e: any) {
        this.error = e instanceof ApiError ? e.message : (e?.message ?? '상세 조회 실패');
        throw e;
      } finally {
        this.loadingDetail = false;
      }
    },
    clearSelected() { this.selected = null; },
  },
});
