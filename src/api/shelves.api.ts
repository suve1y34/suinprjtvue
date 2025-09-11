import { apiClient  } from "./http";
import { EP } from "./endpoints";
import type { Bookshelf, ShelfBook, ShelfAddPayload, ShelfUpdatePayload, ShelfListOpts  } from "@/types/shelf";


export const shelvesApi = {
  // 책장 정보
  myShelf(userId: number): Promise<Bookshelf> {
    return apiClient.post(EP.shelves.myShelf, null, { userId })
  },

  // 책장 안의 책
  listShelfBooks(bookshelfId: number, opts?: ShelfListOpts): Promise<ShelfBook[]> {
    const body: any = { bookshelfId };
    if (opts?.status) body.status = opts.status;
    if (typeof opts?.year === "number") body.year = opts.year;
    if (typeof opts?.month === "number") body.month = opts.month;
    
    return apiClient.post<ShelfBook[]>(EP.shelves.list, body);
  },

  // 책 추가
  addShelfItem(payload: ShelfAddPayload) {
    return apiClient.post(EP.shelves.add, payload);
  },

  // 책 수정
  updateShelfItem(payload: ShelfUpdatePayload) {
    return apiClient.post(EP.shelves.update, payload);
  },

  // 책 제거
  removeShelfItem(bookshelfId: number, bookId: number) {
    return apiClient.post(EP.shelves.remove, null, { bookshelfId, bookId });
  },
};