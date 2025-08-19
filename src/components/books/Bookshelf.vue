<template>
  <div class="shelf" role="list">
    <BookSpine
      v-for="(book, i) in books"
      :key="book.bookId"
      :book="book"
      :index="i"
      role="listitem"
    />
  </div>
</template>

<script setup lang="ts">
import type { Book } from "@/types/book";
import BookSpine from "./BookSpine.vue";

const props = defineProps<{ books: Book[] }>();
</script>

<style scoped>
.shelf {
  display: flex;
  flex-wrap: wrap;          /* 줄바꿈 */
  align-items: flex-end;    /* 밑면 정렬 */
  align-content: flex-start;
  gap: 0;                   /* 간격 없음 */
  line-height: 0;           /* 인라인 간격 제거 */
}
.shelf > * {
  flex: 0 0 auto;
}
</style>