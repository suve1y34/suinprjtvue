export interface Note {
    noteId: number;
    bookId: number;
    userId: number;
    content: string;
    rating?: number | null;
    createdDatetime: string;
    modifiedDatetime: string;
}