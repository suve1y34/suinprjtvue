export interface AladinBook {
    isbn13Code: string;
    title: string;
    author: string;
    pages?: number | null;
    publisher?: string | null;
    pubDate?: string | null;
}