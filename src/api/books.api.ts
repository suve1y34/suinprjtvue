import { apiClient } from './http';
import { EP } from "./endpoints";
import type { Book, PublicReivew, ListPublicReviewsReq, ListPublicReviewsRes } from '@/types/book';

export const booksApi = {
  // 책 리스트/상세 -> 테스트용..
  list(): Promise<Book[]> {
    return apiClient.post<Book[]>(EP.books.list);
  },
  detail(bookId: number): Promise<Book> {
    return apiClient.post<Book>(EP.books.detail, null, { bookId });
  },

  // 책 메모 리스트
  async listPublicReviews(params: ListPublicReviewsReq): Promise<ListPublicReviewsRes> {
    const size = params.size ?? 10;

    const raw: any = await apiClient.post(EP.books.publicReviews, null, {
      isbn13Code: params.isbn13Code,
      bookId: params.bookId,
      cursor: params.cursor ?? null,
      size,
    });

    const data = raw?.data ?? raw;

    let items: PublicReivew[] = [];
    let nextCursor: number | null = null;
    let outSize = size;

    if (Array.isArray(data)) {
      items = data;
    } else if (data && Array.isArray(data.items)) {
      items = data.items;
      nextCursor = data.nextCursor ?? null;
      outSize = data.size ?? outSize;
    } else {
      items = [];
    }

    if (nextCursor == null && items.length >= outSize) {
      const last: any = items[items.length - 1];
      const id = last?.memoId ?? last?.shelfBookId ?? null;
      nextCursor = typeof id === "number" ? id : null;
    }

    return { items, nextCursor, size: outSize };
  },
};