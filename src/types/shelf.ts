import type { Book } from "./book";

export interface Bookshelf {
  bookshelfId: number;
}

export type ReadingStatus = "PLAN" | "READING" | "DONE";

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