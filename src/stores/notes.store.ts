import { defineStore } from "pinia";
import { notesApi } from "@/api/notes.api";
import type { Note } from "@/types/note";

export const useNotesStore = defineStore("notes", {
    state: () => ({
        items: [] as Note[],
        loading: false,
        error: null as string | null,
    }),
    actions: {
        async fetch(bookId: number) {
            this.loading = true;
            this.error = null;
            try {
                this.items = await notesApi.list(bookId);
            } catch(e: any) {
                this.error = e?.message ?? "메모 로드 실패";
            } finally {
                this.loading = false;
            }
        },
        async create(bookId: number, content: string, rating?: number | null) {
            const created = await notesApi.create(bookId, content, rating);
            this.items = [created, ...this.items];
            return created;
        },
        async update(noteId: number, content: string, rating: number | null) {
            const updated = await notesApi.update(noteId, content, rating);
            this.items = this.items.map(n => n.noteId === noteId ? updated : n);
            return updated;
        },
        async remove(noteId: number) {
            await notesApi.remove(noteId);
            this.items = this.items.filter(n => n.noteId !== noteId);
        },
        reset() {
            this.items = [];
            this.loading = false;
            this.error = null;
        },
    }
});