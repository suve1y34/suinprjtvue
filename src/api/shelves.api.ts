import { apiClient  } from "./http";
import type { Bookshelf, ShelfBook } from "@/types/shelf";

const endpoints = {
    bookshelfList: "/api/books/list",      // Bookshelf[]
    shelfBookList: "/api/shelves/books/list",     // ShelfBook[] (book 포함)
    shelfBookAdd: "/api/shelves/books/add",       // 쿼리: bookshelfId, bookId
    shelfBookUpdate: "/api/shelves/books/update",       // 쿼리: bookshelfId, bookId
    shelfBookRemove: "/api/shelves/books/remove", // 쿼리: bookshelfId, bookId
}

export const shelvesApi = {
  list(): Promise<Bookshelf[]> {
    return apiClient.post<Bookshelf[]>(endpoints.bookshelfList);
  },
  listShelfBooks(bookshelfId: number): Promise<ShelfBook[]> {
    // book 조인 포함해 내려오는 것을 전제로 함
    return apiClient.post<ShelfBook[]>(endpoints.shelfBookList, null, { bookshelfId });
  },
  addBook(bookshelfId: number, bookId: number) {
    return apiClient.post(endpoints.shelfBookAdd, null, { bookshelfId, bookId });
  },
  updateBook(bookshelfId: number, bookId: number) {
    return apiClient.post(endpoints.shelfBookUpdate, {}, {});
  },
  removeBook(bookshelfId: number, bookId: number) {
    return apiClient.post(endpoints.shelfBookRemove, null, { bookshelfId, bookId });
  },
};