<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useBooksStore } from '@/stores/books.store';

import BookCard from '@/components/books/BookCard.vue';
import BookDetailModal from '@/components/books/BookDetailModal.vue';

const store = useBooksStore();
const { items, loadingList, loadingDetail, selected, error } = storeToRefs(store);
const keyword = ref(''); 

onMounted(() => {
  store.fetchList();
});

function onOpenDetail(id: number) {
  store.fetchDetail(id);
}
function onCloseDetail() {
  store.clearSelected();
}
</script>

<template>
  <section class="p-4 max-w-5xl mx-auto">
    <header class="flex gap-2 mb-4">
      <input v-model="keyword" class="border rounded px-3 py-2 flex-1" placeholder="검색(향후 사용)" />
      <button class="border rounded px-4 py-2" @click="store.fetchList()">새로고침</button>
    </header>

    <div v-if="error" class="text-red-600 mb-3">{{ error }}</div>
    <div v-if="loadingList">불러오는 중…</div>

    <div v-else class="flex flex-wrap gap-2">
      <BookCard v-for="(b, idx) in items" :key="b.bookId" :book="b" :index="idx" @click="onOpenDetail(b.bookId)" />
    </div>

    <BookDetailModal
      v-if="selected"
      :book="selected"
      :loading="loadingDetail"
      @close="onCloseDetail"
    />
  </section>
</template>
