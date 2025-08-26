import { apiClient  } from "./http";
import type { Bookshelf, ShelfBook } from "@/types/shelf";

const endpoints = {
    myShelf: "/api/shelves/books/me",
    shelfBookList: "/api/shelves/books/list",
    shelfBookAdd: "/api/shelves/books/add",
    shelfBookUpdate: "/api/shelves/books/update",
    shelfBookRemove: "/api/shelves/books/remove",
    shelfBookUpdateProgress: "/api/shelves/books/updateProgress",
}

export type ShelfAddByIsbn13Payload = {
  isbn13Code: string;
  title?: string;
  author?: string;
  pages?: number;
  publisher?: string;
  pubDate?: string; // "YYYY-MM-DD"
};

export const shelvesApi = {
  me(userId: number): Promise<Bookshelf> {
    return apiClient.post(endpoints.myShelf, null, { userId })
  },
  listShelfBooks(bookshelfId: number): Promise<ShelfBook[]> {
    // book 조인 포함해 내려오는 것을 전제로 함
    return apiClient.post<ShelfBook[]>(endpoints.shelfBookList, null, { bookshelfId });
  },
  addBook(bookshelfId: number, payload: ShelfAddByIsbn13Payload) {
    return apiClient.post(endpoints.shelfBookAdd, payload, { bookshelfId });
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
};