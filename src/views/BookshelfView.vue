<template>
  <section class="page">
    <header class="head">
      <h1>책장</h1>
      <div class="controls">
        <button @click="reload" :disabled="loadingShelf || loadingItems">새로고침</button>
        <button @click="onLogout" class="logout">로그아웃</button>
      </div>
    </header>

    <div v-if="loadingShelf" class="state">책장 불러오는 중…</div>
    <div v-else-if="shelfError" class="state error">{{ shelfError }}</div>

    <div v-if="bookshelfId">

      <Bookshelf :entries="store.shelfEntries" />

      <BookSearchModal ref="searchRef" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { storeToRefs } from "pinia";
import Bookshelf from "@/components/books/Bookshelf.vue";
import { useShelvesStore } from "@/stores/shelves.store";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "vue-router";

const store = useShelvesStore();
const { books, bookshelfId } = storeToRefs(store);

const tempBookId = ref<number>(0);

const loadingShelf = computed(() => store.loading.shelf);
const loadingItems = computed(() => store.loading.items);
const shelfError = computed(() => store.error.shelf);
const itemsError = computed(() => store.error.items);

const auth = useAuthStore();
const router = useRouter();

const canMutate = computed(() => !!bookshelfId.value && !loadingItems.value && !!tempBookId.value);

const userId = computed(() => auth.user?.userId ?? null);

function resetInput() {
  tempBookId.value = 0;
}

function reload() {
  if (!userId.value) return;
  store.fetchMyShelf(userId.value).then(() => store.fetchShelfItems());
  console.log(books.value)
}

async function onLogout() {
  await auth.logout();
  router.replace({ name: 'login' });
}

onMounted(async () => {
  if (!auth.isAuthenticated || !userId.value) {
    router.replace({ name: 'login' });
    return;
  }
  await reload();
});
</script>

<style scoped>
.page { display: grid; gap: 12px; }
.head { display: flex; justify-content: space-between; align-items: center; }
.controls { display: flex; gap: 12px; align-items: center; }
.toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.logout { background: #fff; color: #c22727; border: 1px solid #c22727; padding: 6px 10px; border-radius: 6px; }
.state { font-size: 14px; }
.error { color: #c22727; }
.spinner { font-size: 13px; opacity: 0.8; }
</style>