import { apiClient } from './http';
import { EP } from "./endpoints";
import type { Book } from '@/types/book';

export const booksApi = {
  list(): Promise<Book[]> {
    // 책 목록 조회 (param body 없이 - 테스트용)
    return apiClient.post<Book[]>(EP.books.list);
  },
  detail(bookId: number): Promise<Book> {
    // 책 상세 조회 (bookId)
    return apiClient.post<Book>(EP.books.detail, null, { bookId });
  },
};
