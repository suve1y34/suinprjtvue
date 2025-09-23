import { defineStore } from "pinia";
import { api } from '@/api';
import { type ShelfUpsertForm, fromApiShelfItem, toAddPayload, toUpdatePayload, monthKeyOf, omitUndefined } from '@/domain/shelf';

import type { ShelfBook, ShelfListOpts, ShelfStats, FinishedMonthResp, FinishedFlatItem, FinishedBook } from "@/types/shelf";
import { pagesToCm } from "@/utils/thickness";

export const useShelvesStore = defineStore("shelves", {
  state: () => ({
    bookshelfId: null as number | null,
    shelfItems: [] as ShelfBook[],
    loading: { shelf: false, items: false, stats: false },
    error:   { shelf: null as string | null, items: null as string | null, stats: null as string | null },
    mutating: false as boolean, // 추가/삭제 중 상태
    stats: null as ShelfStats | null,
    statsYear: new Date().getFullYear() as number, // 선택 연도
    readLogMonthCache: {} as Record<string, FinishedMonthResp>,
    readToday: null as boolean | null,
  }),

  getters: {
    books: (state) => state.shelfItems.map(i => i.book),
    shelfEntries: (state) => state.shelfItems,

    readCount: (state) => state.shelfItems.length,
    totalThicknessCm: (state) =>
      state.shelfItems
        .reduce((sum, i) => sum + pagesToCm(i.book?.pages), 0),
  },

  actions: {
    // 특정 '월' 독서달력 케시 비우기
    invalidateReadLogByDate(isoDate?: string | null) {
      if (!isoDate) return;
      const key = monthKeyOf(isoDate);
      delete this.readLogMonthCache[key];
    },
    // 내 책장 로드
    async fetchMyShelf(userId: number) {
      this.loading.shelf = true; this.error.shelf = null;
      try {
        const shelf = await api.shelves.myShelf(userId);
        this.bookshelfId = shelf.bookshelfId ?? null;
      } catch (e: any) {
        this.error.shelf = e?.message ?? "책장 로드 실패";
        this.bookshelfId = null;
      } finally {
        this.loading.shelf = false;
      }
    },

    // 책장의 책 리스트 로드
    async fetchShelfItems(opts?: ShelfListOpts) {
      if (!this.bookshelfId) return;
      this.loading.items = true; this.error.items = null;
      try {
        const raw = await api.shelves.listShelfBooks(this.bookshelfId, opts);
        this.shelfItems = raw.map(fromApiShelfItem);
      } catch (e: any) {
        this.error.items = e?.message ?? "책 목록 로드 실패";
      } finally { this.loading.items = false; }
    },

    // 책 추가
    async addBookToShelf(form: ShelfUpsertForm) {
      if (!this.bookshelfId) throw new Error("책장이 없습니다.");
      this.mutating = true;

      try {
        const payload = toAddPayload(form);

        await api.shelves.addShelfItem(omitUndefined(payload));

        // 달력 캐시 무효화 (DONE인 경우..)
        if (form.readingStatus === 'DONE' && form.endDate) {
          delete this.readLogMonthCache[monthKeyOf(form.endDate)];
        }
        await this.fetchShelfItems();
      } finally {
        this.mutating = false;
      }
    },

    // 책 수정
    async updateShelfItem(form: ShelfUpsertForm, initial?: Partial<ShelfUpsertForm>) {
      const payload = omitUndefined(toUpdatePayload(form, initial));
      await api.shelves.updateShelfItem(payload);

      if (form.readingStatus === 'DONE' && form.endDate) {
        delete this.readLogMonthCache[monthKeyOf(form.endDate)];
      }
      await this.fetchShelfItems();
    },

    // 책 삭제
    async removeBookFromShelf(bookId: number) {
      if (!this.bookshelfId) return;
      const prev = [...this.shelfItems];
      this.shelfItems = prev.filter((i) => i.bookId !== bookId);
      try {
        await api.shelves.removeShelfItem(this.bookshelfId, bookId);
      } catch (e) {
        this.shelfItems = prev; // 롤백
        throw e;
      } finally {
        this.mutating = false;
      }
    },

    async fetchStats(year?: number) {
      this.loading.stats = true;
      this.error.stats = null;
      try {
        const y = year ?? this.statsYear;
        const res = await api.shelves.stats(y);
        this.stats = res;
        this.statsYear = y;
      } catch (e: any) {
        this.error.stats = e?.message ?? "통계 로드 실패";
        this.stats = null;
      } finally {
        this.loading.stats = false;
      }
    },

    async fetchReadLogByMonth(year: number, month: number, useCache = true) {
      const key = `${year}-${String(month).padStart(2, '0')}`;
      if (useCache && this.readLogMonthCache[key]) return this.readLogMonthCache[key];

      const flat: FinishedFlatItem[] = await api.shelves.finishedByMonth({ year, month });

      const days: Record<string, FinishedBook[]> = {};
      for (const it of flat) {
        const k = it.dateStr;
        if (!k) continue; // 안전장치
        if (!days[k]) days[k] = [];
        days[k].push({
          dateStr: it.dateStr,
          shelfBookId: it.shelfBookId,
          bookId: it.bookId,
          title: it.title,
          coverImageUrl: it.coverImageUrl ?? undefined,
          isbn13Code: it.isbn13Code ?? undefined,
        });
      }

      const resp: FinishedMonthResp = { year, month, days };
      this.readLogMonthCache[key] = resp;
      return resp;
    },

    async fetchReadToday() {
      try {
        const { readToday } = await api.shelves.readToday();
        this.readToday = !!readToday;
      } catch(e) {
        this.readToday = null;
      }
    },
  },
});