<template>
  <section class="page">
    <header class="page__bar">
      <div></div>
      <h1 class="page-title page-title--xl">
        <span class="brand">
          <span class="brand__chek">책</span><span class="brand__dam">담</span><span class="brand__chek">책</span><span class="brand__dam">담</span>
        </span>
      </h1>
      <div class="page__controls">
        <button type="button" class="btn btn--outline-black" @click="openSearch">책 추가</button>
        <button class="btn btn--outline-brand" @click="reload" :disabled="loadingShelf || loadingItems">새로고침</button>
        <button @click="onLogout" class="btn btn--outline-danger">로그아웃</button>
      </div>

    </header>

    <div v-if="loadingShelf" class="state">책장 불러오는 중…</div>
    <div v-else-if="shelfError" class="state state--error">{{ shelfError }}</div>

    <div v-if="bookshelfId" class="shelf-wrap">

      <Bookshelf class="shelf--center" :entries="store.shelfEntries" />
      <BookSearchModal ref="searchRef" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { storeToRefs } from "pinia";
import Bookshelf from "@/components/books/Bookshelf.vue";
import BookSearchModal from "@/components/books/BookSearchModal.vue";
import { useShelvesStore } from "@/stores/shelves.store";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "vue-router";

const store = useShelvesStore();
const { bookshelfId } = storeToRefs(store);

const tempBookId = ref<number>(0);

const loadingShelf = computed(() => store.loading.shelf);
const loadingItems = computed(() => store.loading.items);
const shelfError = computed(() => store.error.shelf);

const auth = useAuthStore();
const router = useRouter();

const userId = computed(() => auth.user?.userId ?? null);

// 타입 안전한 ref (둘 중 하나)
const searchRef = ref<InstanceType<typeof BookSearchModal> | null>(null);

function openSearch() {
  searchRef.value?.open();
}

function reload() {
  if (!userId.value) return;
  store.fetchMyShelf(userId.value).then(() => store.fetchShelfItems());
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
</style>