import type { Book } from "./book";

export interface Bookshelf {
  bookshelfId: number;
}

export type MemoVisibility = "PRIVATE" | "PUBLIC";
export type ReadingStatus = "PLAN" | "READING" | "DONE";
export type BookLike = { title?: string; author?: string; pages?: number; isbn13Code?: string };

export interface ShelfBook {
  shelfBookId: number;
  bookshelfId: number;
  bookId: number;
  currentPage: number;     
  readingStatus: ReadingStatus;
  memo?: string | null;
  memoVisibility?: MemoVisibility;
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
  memo?: string | null;
  memoVisibility?: MemoVisibility;
};

export type AddPayload = {
  book: BookLike;
  status: "PLAN" | "READING" | "DONE";
  currentPage: number;
  memo?: string;
  memoVisibility?: MemoVisibility;
};

export type ShelfAddPayload =
  | { bookshelfId: number; bookId: number; readingStatus?: ReadingStatus; currentPage?: number; memo?: string | null; memoVisibility?: MemoVisibility }
  | ({ bookshelfId: number } & ShelfAddByIsbn13Payload);

export type ShelfUpdatePayload = {
  shelfBookId: number;
  currentPage: number;     
  readingStatus: ReadingStatus;
  memo?: string | null;
  memoChanged?: boolean | null;
  memoVisibility?: MemoVisibility;
};

export type ShelfListOpts = {
  status?: ReadingStatus;
  year?: number;
  month?: number;
};