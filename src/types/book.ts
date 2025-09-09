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
