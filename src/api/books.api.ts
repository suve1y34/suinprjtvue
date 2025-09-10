import { apiClient } from './http';
import { EP } from "./endpoints";
import type { Book } from '@/types/book';

export interface PublicMemo {
  shelfBookId?: number;
  nickname: string;
  addedDatetime: string; // "YYYY-MM-DD HH:mm:ss"
  memo: string;
}

export interface ListPublicMemosReq {
  bookId?: number;
  isbn13Code?: string;
  page?: number; // 1-base
  size?: number; // default 10
}

export interface ListPublicMemosRes {
  items: PublicMemo[];
  page: number;
  size: number;
  hasMore: boolean;
}

export const booksApi = {
  list(): Promise<Book[]> {
    return apiClient.post<Book[]>(EP.books.list);
  },
  detail(bookId: number): Promise<Book> {
    return apiClient.post<Book>(EP.books.detail, null, { bookId });
  },

  // ✅ 항상 동일한 결과 형태로 정규화
  async listPublicMemos(params: ListPublicMemosReq): Promise<ListPublicMemosRes> {
    const page = params.page ?? 1;
    const size = params.size ?? 10;

    const raw: any = await apiClient.post(EP.books.publicMemos, null, {
      isbn13Code: params.isbn13Code,
      bookId: params.bookId,
      page,
      size,
    });

    const payload = raw?.items ?? raw?.data?.items ?? raw?.data ?? raw;

    let items: PublicMemo[] = [];
    let hasMore = false;
    let outPage = page;
    let outSize = size;

    if (Array.isArray(payload)) {
      items = payload;
      hasMore = items.length >= size; // 리스트 길이로 추정
    } else if (payload && Array.isArray(payload.items)) {

      items = payload.items;
      outPage = payload.page ?? page;
      outSize = payload.size ?? size;
      hasMore = payload.hasMore ?? (items.length >= outSize);
    } else {
      items = [];
      hasMore = false;
    }

    return { items, page: outPage, size: outSize, hasMore };
  },
};