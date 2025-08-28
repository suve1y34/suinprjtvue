import { apiClient } from "./http";
import type { Note } from "@/types/note";

const endpoints = {
  list: "/notes/list",
  create: "/notes/create",
  update: "/notes/update",
  delete: "/notes/delete",
};

export const notesApi = {
  list(bookId: number): Promise<Note[]> {
    return apiClient.post<Note[]>(endpoints.list, { bookId });
  },
  create(bookId: number, content: string, rating?: number | null): Promise<Note> {
    return apiClient.post<Note>(endpoints.create, { bookId, content, rating });
  },
  update(noteId: number, content: string, rating?: number | null): Promise<Note> {
    return apiClient.post<Note>(endpoints.update, { noteId, content, rating });
  },
  remove(noteId: number): Promise<{ success: boolean }> {
    return apiClient.post(endpoints.delete, { noteId });
  },
};
