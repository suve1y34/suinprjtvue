import { apiClient  } from "./http";
import { EP } from "./endpoints";
import type { Bookshelf, ShelfBook, ShelfAddPayload, ShelfUpdatePayload, ShelfListOpts  } from "@/types/shelf";


export const shelvesApi = {
  me(userId: number): Promise<Bookshelf> {
    return apiClient.post(EP.shelves.myShelf, null, { userId })
  },
  listShelfBooks(bookshelfId: number, opts?: ShelfListOpts): Promise<ShelfBook[]> {
    const body: any = { bookshelfId };
    if (opts?.status) body.status = opts.status;
    if (typeof opts?.year === "number") body.year = opts.year;
    if (typeof opts?.month === "number") body.month = opts.month;
    
    return apiClient.post<ShelfBook[]>(EP.shelves.list, body);
  },
  addBook(payload: ShelfAddPayload) {
    return apiClient.post(EP.shelves.add, payload);
  },
  updateShelfItem(payload: ShelfUpdatePayload) {
    return apiClient.post(EP.shelves.update, payload);
  },
  removeBook(bookshelfId: number, bookId: number) {
    return apiClient.post(EP.shelves.remove, null, { bookshelfId, bookId });
  },
};