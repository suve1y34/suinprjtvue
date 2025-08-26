<template>
  <div class="shelf" role="list">
    <BookSpine
      v-for="(entry, i) in entries"
      :key="entry.bookId"
      :book="entry.book"
      :index="i"
      role="listitem"
    />
  </div>
</template>

<script setup lang="ts">
import { useShelvesStore } from "@/stores/shelves.store";
import BookSpine from "./BookSpine.vue";
import type { ShelfBook } from "@/types/shelf";

const props = defineProps<{ entries: ShelfBook[] }>();

const store = useShelvesStore();

function edit(entry: ShelfBook) {
  const max = entry.book.pages ?? undefined;
  const initial = String(entry.currentPage ?? 0);
  const input = window.prompt(`현재 페이지 (0${max ? " ~ " + max : ""})`, initial);
  if (input == null) return;
  const num = Number(input);
  if (!Number.isFinite(num) || num < 0 || (typeof max === "number" && num > max)) {
    alert("유효한 페이지 수를 입력하세요.");
    return;
  }
  store.updateProgress(entry.shelfBookId, num, max).catch((e: any) => {
    alert(e?.message ?? "저장 실패");
  });
}
</script>

<style scoped>
.shelf { display:flex; flex-wrap:wrap; align-items:flex-end; align-content:flex-start; gap:0; line-height:0; }
.cell { display:flex; flex-direction:column; align-items:center; padding:0 2px; }
.progress { font-size:11px; line-height:1; margin-top:4px; opacity:.8; }
</style>