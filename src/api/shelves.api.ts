import { apiClient  } from "./http";
import type { Bookshelf, ShelfBook } from "@/types/shelf";

const endpoints = {
    myShelf: "/shelves/books/me",
    shelfBookList: "/shelves/books/list",
    shelfBookAdd: "/shelves/books/add",
    shelfBookUpdate: "/shelves/books/update",
    shelfBookRemove: "/shelves/books/remove",
    shelfBookUpdateProgress: "/shelves/books/updateProgress",
    shelfBookUpdateMemo: "/shelves/books/updateMemo",
}

export type ShelfAddByIsbn13Payload = {
  isbn13Code: string;
  title?: string;
  author?: string;
  pages?: number;
  publisher?: string;
  pubDate?: string; // "YYYY-MM-DD"
  readingStatus?: "PLAN"|"READING"|"DONE";
  currentPage?: number;
  memo?: string;
};

export type ShelfAddPayload =
  & { bookshelfId: number }
  & ({ bookId: number } | ShelfAddByIsbn13Payload);

export const shelvesApi = {
  me(userId: number): Promise<Bookshelf> {
    return apiClient.post(endpoints.myShelf, null, { userId })
  },
  listShelfBooks(bookshelfId: number): Promise<ShelfBook[]> {
    // book 조인 포함해 내려오는 것을 전제로 함
    return apiClient.post<ShelfBook[]>(endpoints.shelfBookList, null, { bookshelfId });
  },
  addBook(payload: ShelfAddPayload) {
    return apiClient.post(endpoints.shelfBookAdd, payload);
  },
  updateBook(bookshelfId: number, bookId: number) {
    return apiClient.post(endpoints.shelfBookUpdate, {}, { bookshelfId, bookId });
  },
  removeBook(bookshelfId: number, bookId: number) {
    return apiClient.post(endpoints.shelfBookRemove, null, { bookshelfId, bookId });
  },
  updateProgress(payload: { shelfBookId: number, currentPage: number }) {
    return apiClient.post(endpoints.shelfBookUpdateProgress, payload);
  },
  updateStatus(payload: { shelfBookId: number; readingStatus: "PLAN"|"READING"|"DONE" }) {
    return apiClient.post(endpoints.shelfBookUpdate, payload); 
  },
  updateMemo(shelfBookId: number, memo: string | null) {
    return apiClient.post(endpoints.shelfBookUpdateMemo, { shelfBookId, memo });
  },
};