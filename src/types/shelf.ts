import type { Book } from "./book";

export interface Bookshelf {
  bookshelfId: number;
}

export type ReadingStatus = "PLAN" | "READING" | "DONE";
export type BookLike = { title?: string; author?: string; pages?: number; isbn13Code?: string };

export interface ShelfBook {
  shelfBookId: number;
  bookshelfId: number;
  bookId: number;
  currentPage: number;     
  readingStatus: ReadingStatus;
  memo?: string | null;
  addedDatetime: string;
  modifiedDatetime: string;
  book: Book;
}

export type ShelfAddByIsbn13Payload = {
  isbn13Code: string;
  title?: string;
  author?: string;
  pages?: number;
  publisher?: string;
  pubDate?: string; // "YYYY-MM-DD"
  readingStatus?: "PLAN"|"READING"|"DONE";
  currentPage?: number;
  memo?: string;
};

export type AddPayload = {
  book: {
    isbn13Code?: string;
    title?: string;
    author?: string;
    pages?: number;
    publisher?: string;
    pubDate?: string;
  };
  status: "PLAN" | "READING" | "DONE";
  currentPage: number;
};

export type ShelfAddPayload =
  & { bookshelfId: number }
  & ({ bookId: number } | ShelfAddByIsbn13Payload);

export type ShelfUpdatePayload = {
  shelfBookId: number;
  currentPage: number;     
  readingStatus: ReadingStatus;
  memo?: string | null;
  memoChanged?: boolean | null;
}