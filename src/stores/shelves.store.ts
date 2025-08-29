import { defineStore } from "pinia";
import type { Bookshelf, ShelfBook } from "@/types/shelf";
import type { Book } from "@/types/book";
import { shelvesApi, type ShelfAddByIsbn13Payload, type ShelfAddPayload } from "@/api/shelves.api";

function normalizeShelfItem(raw: any): ShelfBook {
  const book: Book = {
    bookId: raw.bookId,
    isbn13Code: raw.isbn13Code ?? "",      // BE가 안 주면 빈값
    title: raw.title ?? "",
    author: raw.author ?? "",
    pages: typeof raw.pages === "number" ? raw.pages : undefined,
    publisher: raw.publisher,
    pubDate: raw.pubDate,
  };
  return {
    shelfBookId: raw.shelfBookId,
    bookshelfId: raw.bookshelfId,
    bookId: raw.bookId,
    currentPage: typeof raw.currentPage === "number" ? raw.currentPage : 0,
    readingStatus: (raw.readingStatus as any) ?? "PLAN",
    addedDatetime: raw.addedDatetime,
    modifiedDatetime: raw.modifiedDatetime,
    book,
  };
}

export const useShelvesStore = defineStore("shelves", {
  state: () => ({
    bookshelfId: null as number | null,
    shelfItems: [] as ShelfBook[],
    loading: { shelf: false, items: false },
    error:   { shelf: null as string | null, items: null as string | null },
    mutating: false as boolean, // 추가/삭제 중 상태
  }),

  getters: {
    books: (state) => state.shelfItems.map(i => i.book),
    shelfEntries: (state) => state.shelfItems,
  },

  actions: {
    async fetchMyShelf(userId: number) {
      this.loading.shelf = true; this.error.shelf = null;
      try {
        const shelf = await shelvesApi.me(userId);
        this.bookshelfId = shelf.bookshelfId ?? null;
      } catch (e: any) {
        this.error.shelf = e?.message ?? "책장 로드 실패";
        this.bookshelfId = null;
      } finally {
        this.loading.shelf = false;
      }
    },

    async fetchShelfItems() {
      if (!this.bookshelfId) return;
      this.loading.items = true; this.error.items = null;
      try {
        const raw = await shelvesApi.listShelfBooks(this.bookshelfId);
        this.shelfItems = raw.map(normalizeShelfItem);
      } catch (e: any) {
        this.error.items = e?.message ?? "책 목록 로드 실패";
      } finally { this.loading.items = false; }
    },

    async addBookToShelf(arg: number | ShelfAddByIsbn13Payload) {
      if (!this.bookshelfId) throw new Error("책장이 없습니다.");
      const prev = [...this.shelfItems];

      this.mutating = true;

      try {
        const payload: ShelfAddPayload =
          typeof arg === "number"
            ? { bookshelfId: this.bookshelfId, bookId: arg }
            : { bookshelfId: this.bookshelfId, ...arg };

        await shelvesApi.addBook(payload);
        await this.fetchShelfItems();
      } catch (e) {
        throw e;
      }
    },

    async removeBookFromShelf(bookId: number) {
      if (!this.bookshelfId) return;
      const prev = [...this.shelfItems];
      this.shelfItems = prev.filter((i) => i.bookId !== bookId);
      try {
        await shelvesApi.removeBook(this.bookshelfId, bookId);
      } catch (e) {
        this.shelfItems = prev; // 롤백
        throw e;
      } finally {
        this.mutating = false;
      }
    },

    async updateProgress(shelfBookId: number, currentPage: number, totalPages?: number) {
      this.mutating = true;
      // 0 ~ totalPages
      let cp = Math.max(0, Number.isFinite(currentPage) ? currentPage : 0);
      if (typeof totalPages === 'number') cp = Math.min(cp, totalPages);
        try {
          await shelvesApi.updateProgress({ shelfBookId, currentPage: cp });
          await this.fetchShelfItems();
        } catch(e) {
          throw e;
        } finally {
          this.mutating = false;
        }
    },

    async updateStatus(shelfBookId: number, status: "PLAN"|"READING"|"DONE") {
      this.mutating = true;
      try {
        await shelvesApi.updateStatus({ shelfBookId, readingStatus: status });
      } catch(e) {
        throw e;
      } finally {
        this.mutating = false;
      }
    }
  },
});