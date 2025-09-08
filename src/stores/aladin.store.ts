import { defineStore } from "pinia";
import { api } from '@/api';
import type { AladinBook } from "@/types/aladin";

export const useAladinStore = defineStore('aladin', {
  state: () => ({
    keyword: '' as string,
    results: [] as AladinBook[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    // 책 검색 (키워드)
    async search(keyword?: string) {
      const q = (keyword ?? this.keyword).trim();
      if (!q) { this.results = []; this.error = null; return; }

      this.loading = true; this.error = null;
      try {
          this.results = await api.aladin.search(q, 1, 20);
      } catch(e: any) {
          this.error = e?.message ?? '검색 실패';
          this.results = [];
      } finally {
          this.loading = false;
      }
    },
    // 검색 초기화
    clear() {
      this.keyword = '';
      this.results = [];
      this.error = null;
    }
  },
});