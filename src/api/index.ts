import { aladinApi } from './aladin.api';
import { authApi } from './auth.api';
import { booksApi } from '@/api/books.api';
import { shelvesApi } from './shelves.api';
import { usersApi } from './users.api';

export const api = {
  aladin: aladinApi,
  auth: authApi,
  books: booksApi,
  shelves: shelvesApi,
  users: usersApi,
};

export * from '@/api/http';