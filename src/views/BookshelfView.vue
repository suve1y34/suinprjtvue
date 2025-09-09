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
        <!-- 테마 아이콘 버튼(기존 버튼 스타일은 유지) -->
        <button
          type="button"
          class="icon-btn"
          :title="`테마: ${themeLabel}`"
          :aria-label="`테마: ${themeLabel}`"
          @click="toggleTheme"
        >
          <!-- 시스템 -->
          <svg v-if="themeStore.mode === 'system'" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <rect x="3" y="4" width="18" height="14" rx="2" ry="2" stroke="currentColor" fill="none"/>
            <path d="M8 20h8" stroke="currentColor" fill="none"/>
          </svg>
          <!-- 라이트 -->
          <svg v-else-if="themeStore.mode === 'light'" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="12" cy="12" r="4" stroke="currentColor" fill="none"/>
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4M17.6 17.6 19 19M5 19l1.4-1.4M17.6 6.4 19 5" stroke="currentColor" fill="none"/>
          </svg>
          <!-- 다크 -->
          <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" stroke="currentColor" fill="none"/>
          </svg>
        </button>

        <button type="button" class="btn btn--outline-black" @click="openSearch">책 추가</button>
        <button @click="onLogout" class="btn btn--outline-danger">로그아웃</button>
      </div>
    </header>

    <!-- ▼ 필터 툴바(왼쪽 정렬) -->
    <div class="page__toolbar">
      <select
        class="btn btn--outline-black"
        v-model="statusSel"
        @change="onFilterChange"
        :disabled="loadingShelf || loadingItems"
        title="읽기 상태 필터"
      >
        <option value="">전체</option>
        <option value="PLAN">PLAN</option>
        <option value="READING">READING</option>
        <option value="DONE">DONE</option>
      </select>

      <select
        class="btn btn--outline-black"
        v-model="yearSel"
        @change="onFilterChange"
        :disabled="loadingShelf || loadingItems"
        title="연도 필터"
      >
        <option value="">전체 연도</option>
        <option v-for="y in years" :key="y" :value="String(y)">{{ y }}</option>
      </select>

      <select
        class="btn btn--outline-black"
        v-model="monthSel"
        @change="onFilterChange"
        :disabled="loadingShelf || loadingItems"
        title="월 필터"
      >
        <option value="">전체 월</option>
        <option v-for="m in 12" :key="m" :value="String(m)">{{ m }}</option>
      </select>

      <button
        type="button"
        class="icon-btn"
        :disabled="loadingShelf || loadingItems"
        title="새로고침"
        aria-label="새로고침"
        @click="reload"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M4 4v6h6M20 20v-6h-6" stroke="currentColor" fill="none"/>
          <path d="M20 9a7 7 0 00-12-5.2M4 15a7 7 0 0012 5.2" stroke="currentColor" fill="none"/>
        </svg>
      </button>
    </div>

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
import { useThemeStore } from "@/stores/theme.store";
import type { ReadingStatus, ShelfListOpts } from "@/types/shelf";

const store = useShelvesStore();
const { bookshelfId } = storeToRefs(store);

const loadingShelf = computed(() => store.loading.shelf);
const loadingItems = computed(() => store.loading.items);
const shelfError = computed(() => store.error.shelf);

const auth = useAuthStore();
const router = useRouter();

const userId = computed(() => auth.user?.userId ?? null);

const statusSel = ref<"" | ReadingStatus>("");
const yearSel   = ref<string>(""); // ""=전체
const monthSel  = ref<string>(""); // ""=전체

// 연도 목록(현재연도부터 10년치)
const nowYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => nowYear - i);

// 테마 토글 관련
const themeStore = useThemeStore();
const themeLabel = computed(() => {
  // 버튼 라벨: Light / Dark / System
  return themeStore.mode === 'light' ? '라이트' : themeStore.mode === 'dark' ? '다크' : '시스템';
});
function toggleTheme() {
  themeStore.toggleCycle();
}

const searchRef = ref<InstanceType<typeof BookSearchModal> | null>(null);

function openSearch() {
  searchRef.value?.open();
}

function currentFilter(): ShelfListOpts {
  const status = statusSel.value || undefined;
  const year = yearSel.value ? Number(yearSel.value) : undefined;
  const month = monthSel.value ? Number(monthSel.value) : undefined;
  return { status, year, month };
}

function reload() {
  if (!userId.value) return;
  store.fetchMyShelf(userId.value).then(() => {
    store.fetchShelfItems(currentFilter());
  });
}

function onChangeStatus() {
  store.fetchShelfItems(currentFilter());
}

function onFilterChange() {
  store.fetchShelfItems(currentFilter());
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