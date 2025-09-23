import type {
  ShelfBook,
  ShelfAddPayload,
  ShelfUpdatePayload,
  ReadingStatus,
  Visibility,
  BookLike,
} from '@/types/shelf';
import type { AladinBook } from '@/types/aladin';

// API > FE 모델 정규화
export function fromApiShelfItem(raw: any): ShelfBook {
  return {
    shelfBookId: raw.shelfBookId,
    bookshelfId: raw.bookshelfId,
    bookId: raw.bookId,
    currentPage: typeof raw.currentPage === 'number' ? raw.currentPage : 0,
    readingStatus: (raw.readingStatus as ReadingStatus) ?? 'PLAN',
    memo: raw.memo ?? null,
    memoVisibility: (raw.memoVisibility as Visibility) ?? 'PRIVATE',
    review: raw.review ?? null,
    reviewVisibility: (raw.reviewVisibility as Visibility) ?? 'PRIVATE',
    rating: raw.rating ?? null,
    addedDatetime: raw.addedDatetime,
    modifiedDatetime: raw.modifiedDatetime,
    startDate: raw.startDate,
    endDate: raw.endDate,
    book: {
      bookId: raw.bookId,
      isbn13Code: raw.isbn13Code ?? '',
      title: raw.title ?? '',
      author: raw.author ?? '',
      pages: typeof raw.pages === 'number' ? raw.pages : undefined,
      publisher: raw.publisher,
      pubDate: raw.pubDate,
      coverImageUrl: raw.coverImageUrl ?? null,
    },
  };
}

// search > BookLike (책 추가 폼에 주입할 모델)
export function toBookLikeFromAladin(b: AladinBook): BookLike {
  const pages = (b as any).pages ?? (b as any).itemPage ?? undefined;
  const cover = (b as any).coverImageUrl || (b as any).coverLargeUrl || (b as any).cover || (b as any).coverSmallUrl;
  return {
    title: b.title,
    author: b.author,
    pages,
    isbn13Code: (b as any).isbn13Code,
    coverImageUrl: cover || undefined,
  };
}

// Upsert 폼 모델 (add/upd)
export type ShelfUpsertForm = {
  mode: 'add'|'edit';
  shelfBookId?: number;
  book: BookLike;
  currentPage: number;
  readingStatus: ReadingStatus;
  startDate?: string | null;
  endDate?: string | null;
  memo?: string | null;
  review?: string | null;
  reviewPublic?: boolean;
  rating?: number | null;
  totalPages?: number;           // UI용
};

// Upsert > AddPayload
export function toAddPayload(f: ShelfUpsertForm): ShelfAddPayload {
  const vis: Visibility = f.reviewPublic ? 'PUBLIC' : 'PRIVATE';
  return {
    bookshelfId: (undefined as any), // store에서 주입
    ...(f.book.isbn13Code ? {
      isbn13Code: f.book.isbn13Code!,
      title: f.book.title,
      author: f.book.author,
      pages: f.book.pages,
    } : ({} as any)),
    readingStatus: f.readingStatus,
    currentPage: f.currentPage,
    startDate: f.startDate || undefined,
    endDate: f.endDate || undefined,
    memo: (f.memo ?? '') || undefined,
    memoVisibility: 'PRIVATE',
    review: f.readingStatus === 'DONE' ? ((f.review ?? '') || undefined) : null,
    reviewVisibility: f.readingStatus === 'DONE' ? vis : 'PRIVATE',
    rating: f.readingStatus === 'DONE' ? (f.rating ?? null) : undefined,
  } as ShelfAddPayload;
}

// Upsert > UpdatePayload
export function toUpdatePayload(f: ShelfUpsertForm, initial?: Partial<ShelfUpsertForm>): ShelfUpdatePayload {
  const vis: Visibility = f.reviewPublic ? 'PUBLIC' : 'PRIVATE';
  const memoTrim = (f.memo ?? '').trim();
  const reviewTrim = (f.review ?? '').trim();

  const memoChanged = initial ? memoTrim !== (initial.memo ?? '') : !!memoTrim;
  const reviewChanged = initial
    ? (reviewTrim !== (initial.review ?? '') || (f.reviewPublic ?? false) !== (initial.reviewPublic ?? false))
    : !!reviewTrim;

  return {
    shelfBookId: f.shelfBookId!,
    currentPage: f.currentPage,
    readingStatus: f.readingStatus,
    startDate: f.startDate || undefined,
    endDate: f.endDate || undefined,
    memo: memoChanged ? (memoTrim || null) : undefined,
    memoChanged,
    memoVisibility: 'PRIVATE',
    ...(f.readingStatus === 'DONE'
      ? {
          review: reviewChanged ? (reviewTrim || null) : undefined,
          reviewVisibility: reviewChanged ? vis : undefined,
          reviewChanged,
          rating: f.rating ?? null,
        }
      : {
          review: null,
          reviewVisibility: undefined,
          reviewChanged: true,
          rating: undefined,
        }),
  };
}

// 캐시 무효화 키 생성
export function monthKeyOf(isoDate: string) {
  const [y, m] = isoDate.split('-');
  return `${y}-${m}`;
}

// util: undefined 제거 (API 호출 전..)
export function omitUndefined<T extends Record<string, any>>(obj: T): T {
  const out: any = {};
  for (const k in obj) {
    const v = obj[k];
    if (v !== undefined) out[k] = v;
  }
  return out;
}