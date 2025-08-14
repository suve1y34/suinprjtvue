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
.shelf { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 0; line-height: 0; }
</style>