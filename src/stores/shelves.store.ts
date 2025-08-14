import { defineStore } from "pinia";
import type { Bookshelf, ShelfBook } from "@/types/shelf";
import { shelvesApi } from "@/api/shelves.api";

export const useShelvesStore = defineStore("shelves", {
  state: () => ({
    myShelf: null as Bookshelf | null,
    shelfItems: [] as ShelfBook[],
    loading: { shelf: false, items: false },
    error:   { shelf: null as string | null, items: null as string | null },
  }),

  getters: {
    books: (state) => state.shelfItems.map(i => i.book),
    bookshelfId: (state) => state.myShelf?.bookshelfId ?? null,
  },

  actions: {
    async fetchMyShelf() {
      this.loading.shelf = true; this.error.shelf = null;
      try {
        const list = await shelvesApi.list();
        this.myShelf = list?.[0] ?? null; // 사용자당 1개 가정
      } catch (e: any) {
        this.error.shelf = e?.message ?? "책장 로드 실패";
      } finally { this.loading.shelf = false; }
    },

    async fetchShelfItems() {
      if (!this.myShelf?.bookshelfId) return;
      this.loading.items = true; this.error.items = null;
      try {
        this.shelfItems = await shelvesApi.listShelfBooks(this.myShelf.bookshelfId);
      } catch (e: any) {
        this.error.items = e?.message ?? "책 목록 로드 실패";
      } finally { this.loading.items = false; }
    },

    async addBookToShelf(bookId: number) {
      if (!this.myShelf?.bookshelfId) return;
      const prev = [...this.shelfItems];
      // 낙관적 UI — placeholder (필수 필드 모두 포함)
      this.shelfItems = [
        ...prev,
        {
          shelfBookId: -Date.now(),
          bookshelfId: this.myShelf.bookshelfId,
          bookId,
          addedDatetime: new Date().toISOString(),
          modifiedDatetime: new Date().toISOString(),
          book: { bookId, isbn13Code: "", author: "", title: "", pages: undefined },
        },
      ];
      try {
        await shelvesApi.addBook(this.myShelf.bookshelfId, bookId);
        await this.fetchShelfItems();
      } catch (e) {
        this.shelfItems = prev; // 롤백
        throw e;
      }
    },

    async removeBookFromShelf(bookId: number) {
      if (!this.myShelf?.bookshelfId) return;
      const prev = [...this.shelfItems];
      this.shelfItems = prev.filter((i) => i.bookId !== bookId);
      try {
        await shelvesApi.removeBook(this.myShelf.bookshelfId, bookId);
      } catch (e) {
        this.shelfItems = prev; // 롤백
        throw e;
      }
    },
  },
});