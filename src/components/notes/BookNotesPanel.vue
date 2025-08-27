<template>
  <section class="notes">
    <header>
      <strong>메모</strong>
      <span v-if="store.loading" class="muted">불러오는 중…</span>
      <span v-else-if="store.error" class="err">{{ store.error }}</span>
    </header>

    <form class="editor" @submit.prevent="onCreate">
      <textarea v-model.trim="draft" rows="3" placeholder="메모를 입력하세요"></textarea>
      <label>
        평점:
        <input type="number" v-model.number="rating" min="1" max="5" />
      </label>
      <button type="submit" :disabled="!draft">등록</button>
    </form>

    <ul class="list">
      <li v-for="n in store.items" :key="n.noteId">
        <div class="meta">
          <span class="muted">{{ n.createdDatetime }}</span>
          <span v-if="n.rating" class="badge">★ {{ n.rating }}</span>
        </div>
        <p v-text="n.content"></p>
        <div class="actions">
          <button @click="onEdit(n)">수정</button>
          <button @click="onDelete(n)">삭제</button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useNotesStore } from '@/stores/notes.store';
import type { Note } from '@/types/note';

const props = defineProps<{ bookId: number }>();
const store = useNotesStore();

const draft = ref("");
const rating = ref<number | null>(null);

onMounted(() => { store.fetch(props.bookId); });
watch(() => props.bookId, (v) => v && store.fetch(v));

function onCreate() {
  store.create(props.bookId, draft.value, rating.value ?? null).then(() => {
    draft.value = "";
    rating.value = null;
  });
}

function onEdit(n: Note) {
  const newText = window.prompt("메모 수정", n.content);
  if (newText == null) return;
  const newRating = window.prompt("평점(1~5, 비워두면 유지)", String(n.rating ?? ""));
  const r = newRating === "" ? n.rating : Number(newRating);
  store.update(n.noteId, newText, Number.isFinite(r as number) ? (r as number) : null);
}

function onDelete(n: Note) {
  if (confirm("삭제하시겠습니까?")) store.remove(n.noteId);
}
</script>
<style scoped>
.notes { display: grid; gap: 10px; }
.muted { opacity: .7; font-size: 12px; }
.err { color: #c22727; font-size: 12px; }
.editor { display: grid; gap: 6px; }
.list { display: grid; gap: 10px; list-style: none; padding: 0; }
.badge { font-size: 12px; }
.actions { display: flex; gap: 8px; }
</style>