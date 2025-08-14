import type { Book } from "./book";

export interface Bookshelf {
    bookshelfId: number;
    userId: number;
    createdDatetime: string;
}

export interface ShelfBook {
    shelfBookId: number;
    bookshelfId: number;
    bookId: number;
    addedDatetime: string;
    modifiedDatetime: string;
    book: Book;
}