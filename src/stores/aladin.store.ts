import { defineStore } from "pinia";
import { aladinApi } from "@/api/aladin.api";
import type { AladinBook } from "@/types/aladin";

export const useAladinStore = defineStore('aladin', {
  state: () => ({
    keyword: '' as string,
    results: [] as AladinBook[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async search(keyword?: string) {
      const q = (keyword ?? this.keyword).trim();
      if (!q) { this.results = []; this.error = null; return; }

      this.loading = true; this.error = null;
      try {
          this.results = await aladinApi.search(q, 1, 20);
      } catch(e: any) {
          this.error = e?.message ?? '검색 실패';
          this.results = [];
      } finally {
          this.loading = false;
      }
    },
    clear() {
      this.keyword = '';
      this.results = [];
      this.error = null;
    }
  },
});