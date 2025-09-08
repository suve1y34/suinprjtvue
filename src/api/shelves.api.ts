import { apiClient  } from "./http";
import { EP } from "./endpoints";
import type { Bookshelf, ShelfBook, ShelfAddByIsbn13Payload, ShelfAddPayload } from "@/types/shelf";


export const shelvesApi = {
  me(userId: number): Promise<Bookshelf> {
    return apiClient.post(EP.shelves.myShelf, null, { userId })
  },
  listShelfBooks(bookshelfId: number): Promise<ShelfBook[]> {
    // book 조인 포함해 내려오는 것을 전제로 함
    return apiClient.post<ShelfBook[]>(EP.shelves.list, null, { bookshelfId });
  },
  addBook(payload: ShelfAddPayload) {
    return apiClient.post(EP.shelves.add, payload);
  },
  updateBook(bookshelfId: number, bookId: number) {
    return apiClient.post(EP.shelves.update, {}, { bookshelfId, bookId });
  },
  removeBook(bookshelfId: number, bookId: number) {
    return apiClient.post(EP.shelves.remove, null, { bookshelfId, bookId });
  },
  updateProgress(payload: { shelfBookId: number, currentPage: number }) {
    return apiClient.post(EP.shelves.updateProgress, payload);
  },
  updateStatus(payload: { shelfBookId: number; readingStatus: "PLAN"|"READING"|"DONE" }) {
    return apiClient.post(EP.shelves.update, payload); 
  },
  updateMemo(shelfBookId: number, memo: string | null) {
    return apiClient.post(EP.shelves.updateMemo, { shelfBookId, memo });
  },
};