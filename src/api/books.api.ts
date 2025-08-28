import { apiClient } from './http';
import type { Book } from '@/types/book';

const endpoints = {
  list: '/books/list',
  detail: '/books/detail',
};

export const booksApi = {
  list(): Promise<Book[]> {
    // 본문 없이 POST
    return apiClient.post<Book[]>(endpoints.list);
  },
  detail(bookId: number): Promise<Book> {
    // 쿼리스트링으로 bookId 전달(POST 규칙 유지)
    return apiClient.post<Book>(endpoints.detail, null, { bookId });
  },
};
