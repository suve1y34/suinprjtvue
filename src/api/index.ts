import { booksApi } from '@/api/books.api';
import { notesApi } from './notes.api';

export const api = {
  books: booksApi,
  notes: notesApi,
};

export * from '@/api/http';