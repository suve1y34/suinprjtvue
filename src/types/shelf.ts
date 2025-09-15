import type { Book } from "./book";

export interface Bookshelf {
  bookshelfId: number;
}

export type Visibility = 'PUBLIC'|'PRIVATE';
export type ReadingStatus = "PLAN" | "READING" | "DONE";
export type memoVisibility = Visibility;
export type BookLike = { title?: string; author?: string; pages?: number; isbn13Code?: string; coverImageUrl?: string; };

export interface ShelfBook {
  shelfBookId: number;
  bookshelfId: number;
  bookId: number;
  currentPage: number;     
  startDate?: string;
  endDate?: string;
  readingStatus: ReadingStatus;
  memo?: string | null;
  memoVisibility: Visibility;
  review: string | null;
  reviewVisibility: Visibility;
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
  startDate?: string;
  endDate?: string;
  memo?: string | null;
  memoVisibility: Visibility;
  review: string | null;
  reviewVisibility: Visibility;
};

export type AddPayload = {
  book: BookLike;
  status: "PLAN" | "READING" | "DONE";
  currentPage: number;
  startDate?: string;
  endDate?: string;
  memo?: string;
  memoVisibility?: Visibility;

  // 리뷰(공개 가능)
  review?: string | null;
  reviewVisibility?: Visibility;
};

export type ShelfAddPayload =
  | {
      bookshelfId: number;
      bookId: number;
      readingStatus?: ReadingStatus;
      currentPage?: number;
      startDate?: string;
      endDate?: string;
      memo?: string | null;
      memoVisibility?: Visibility;

      // 리뷰(공개 가능)
      review?: string | null;
      reviewVisibility?: Visibility;
    }
  | ({ bookshelfId: number } & ShelfAddByIsbn13Payload);

export type ShelfUpdatePayload = {
  shelfBookId: number;
  currentPage: number;     
  readingStatus: ReadingStatus;
  startDate?: string; // 'YYYY-MM-DD'
  endDate?: string;   // 'YYYY-MM-DD'
  memo?: string | null;
  memoChanged?: boolean | null;
  memoVisibility?: Visibility;

  // 리뷰(공개 가능)
  review?: string | null;
  reviewVisibility?: Visibility;
  reviewChanged?: boolean | null;
};

export type ShelfListOpts = {
  status?: ReadingStatus;
  year?: number;
  month?: number;

  keyword?: string;
  sort?: 'added' | 'title' | 'pages';
  order?: 'asc' | 'desc';
};

export interface ShelfStats {
  statusRatio: { label: string; value: number; key: string }[];
  monthly: { label: string; value: number; month: number }[];
};