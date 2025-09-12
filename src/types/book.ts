export interface Book {
  bookId: number;
  isbn13Code: string;
  title: string;
  author: string;
  pages?: number;
  publisher?: string;
  pubDate?: string; // "YYYY-MM-DD"
  coverImageUrl?: string;
}

export interface PublicReivew {
  shelfBookId?: number;
  nickname: string;
  addedDatetime: string; // "YYYY-MM-DD HH:mm:ss"
  review: string;
}

// 메모리스트 요청 param
export interface ListPublicReviewsReq {
  bookId?: number;
  isbn13Code?: string;
  cursor?: number | null; // 마지막으로 본 memo id
  size?: number; // default 10
}

// 메모리스트 응답
export interface ListPublicReviewsRes {
  items: PublicReivew[];
  nextCursor: number | null; // 다음 호출에 넘길 커서
  size: number;
}