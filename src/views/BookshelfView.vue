<template>
  <section class="page">
    <header class="head">
      <h1>책장</h1>
      <div class="controls">
        <button @click="reload" :disabled="loadingItems">새로고침</button>
      </div>
    </header>

    <div v-if="loadingShelf" class="state">책장 불러오는 중…</div>
    <div v-else-if="shelfError" class="state error">{{ shelfError }}</div>

    <div v-if="bookshelfId">
      <div class="toolbar">
        <input v-model.number="tempBookId" type="number" placeholder="추가/삭제할 Book ID" />
        <button @click="onAdd" :disabled="loadingItems">추가</button>
        <button @click="onRemove" :disabled="loadingItems">삭제</button>
        <span v-if="loadingItems" class="spinner">로딩…</span>
        <span v-if="itemsError" class="state error">{{ itemsError }}</span>
      </div>

      <Bookshelf :books="books" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { storeToRefs } from "pinia";
import Bookshelf from "@/components/books/Bookshelf.vue";
import { useShelvesStore } from "@/stores/shelves.store";

const store = useShelvesStore();
const { books, bookshelfId } = storeToRefs(store);

const tempBookId = ref<number>(0);

const loadingShelf = computed(() => store.loading.shelf);
const loadingItems = computed(() => store.loading.items);
const shelfError = computed(() => store.error.shelf);
const itemsError = computed(() => store.error.items);

function reload() { store.fetchShelfItems(); }

async function onAdd() {
  if (!bookshelfId.value || !tempBookId.value) return;
  try {
    await store.addBookToShelf(tempBookId.value);
  } catch (e: any) {
    alert(e?.message ?? "추가 실패");
  }
}

async function onRemove() {
  if (!bookshelfId.value || !tempBookId.value) return;
  try {
    await store.removeBookFromShelf(tempBookId.value);
  } catch (e: any) {
    alert(e?.message ?? "삭제 실패");
  }
}

onMounted(async () => {
  await store.fetchMyShelf();
  await store.fetchShelfItems();
});
</script>

<style scoped>
.page { display: grid; gap: 12px; }
.head { display: flex; justify-content: space-between; align-items: center; }
.controls { display: flex; gap: 12px; align-items: center; }
.toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.state { font-size: 14px; }
.error { color: #c22727; }
.spinner { font-size: 13px; opacity: 0.8; }
</style>