import { apiClient  } from "./http";
import { EP } from "./endpoints";
import type { Bookshelf, ShelfBook, ShelfAddPayload, ShelfUpdatePayload, ShelfListOpts, ShelfStats, FinishedFlatItem  } from "@/types/shelf";
import { omitUndefined } from '@/domain/shelf';


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
    if (opts?.keyword && opts.keyword.trim()) body.keyword = opts.keyword.trim();
    body.sort = opts?.sort  ?? 'added';
    body.order = opts?.order ?? 'desc';
    
    return apiClient.post<ShelfBook[]>(EP.shelves.list, body);
  },

  // 책 추가
  addShelfItem(payload: ShelfAddPayload) {
    return apiClient.post(EP.shelves.add, omitUndefined(payload));
  },

  // 책 수정
  updateShelfItem(payload: ShelfUpdatePayload) {
          console.log(payload)
    return apiClient.post(EP.shelves.update, omitUndefined(payload));
  },

  // 책 제거
  removeShelfItem(bookshelfId: number, bookId: number) {
    return apiClient.post(EP.shelves.remove, null, { bookshelfId, bookId });
  },

  // 통계
  stats(year?: number): Promise<ShelfStats> {
    return apiClient.get<ShelfStats>(EP.shelves.stats, { year });
  },

  // 월별 독서
  finishedByMonth(params: { year: number; month: number }): Promise<FinishedFlatItem[]> {
    return apiClient.get<FinishedFlatItem[]>(EP.shelves.finishedByMonth, params);
  },

  // 오늘 독서기록 여부
  readToday(): Promise<{ readToday: boolean }> {
    return apiClient.get(EP.shelves.todayRead);
  },
};