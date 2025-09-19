<template>
  <section class="page">
    <!-- 헤더 -->
    <header class="page__bar">
      <div class="page__left">
        <button
          v-if="nickname"
          type="button"
          class="user-greet"
          @click="openProfile"
          :title="`${nickname} 님`"
          aria-label="내 정보"
        >
          <span class="user-greet__name">{{ nickname }}</span> 님
        </button>
      </div>

      <h1 class="page-title page-title--xl">
        <span class="brand">
          <span class="brand__chek">책</span><span class="brand__dam">담</span><span class="brand__chek">책</span><span class="brand__dam">담</span>
        </span>
      </h1>

      <div class="page__controls">
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

        <button
          type="button"
          class="icon-btn"
          title="책 추가"
          aria-label="책 추가"
          @click="openSearch"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M4 5.5A1.5 1.5 0 015.5 4H18a2 2 0 012 2v12a1 1 0 01-1.5.87L16 17H5.5A1.5 1.5 0 014 15.5v-10z" stroke="currentColor" fill="none"/>
            <path d="M12 8v6M9 11h6" stroke="currentColor" />
          </svg>
        </button>

        <button
          type="button"
          class="icon-btn"
          title="로그아웃"
          aria-label="로그아웃"
          @click="onLogout"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M12 3v10" stroke="currentColor" fill="none"/>
            <path d="M7 7a7 7 0 1010 0" stroke="currentColor" fill="none"/>
          </svg>
        </button>
      </div>
    </header>


    <div class="page__stack">
      <!-- 요약바 -->
      <div class="summarybar">
        <div class="summarybar__left">
          <span class="summary-item" v-if="goalProgress">
            나의 독서 목표 <b>{{ goalProgress.done }}</b>/<b>{{ goalProgress.goal ?? '—' }}</b>
            <span class="muted">({{ goalProgress.progressPercent }}%)</span>
            <span v-if="goalAchieved" class="muted"> · 🎉 목표 달성!</span>
          </span>
        </div>

        <div class="summarybar__right">
          <span class="summary-item" v-if="bookshelfId">
            나의 책장
            <strong>{{ readCount }}</strong>권 · 두께 총 <strong>{{ totalThicknessText }}</strong>
          </span>

          <!-- <button
            type="button"
            class="btn btn--outline-black summary-btn"
            @click="openStats"
          >
            📊 통계 보기
          </button>
          <button type="button" class="icon-btn" :disabled="loadingShelf || loadingItems" title="새로고침" aria-label="새로고침" @click="refreshWithReset">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M4 4v6h6M20 20v-6h-6" stroke="currentColor" fill="none"/>
              <path d="M20 9a7 7 0 00-12-5.2M4 15a7 7 0 0012 5.2" stroke="currentColor" fill="none"/>
            </svg>
          </button> -->

          <button
            type="button"
            class="btn btn--outline-black summary-btn"
            @click="openCalendar"
          >
            독서 달력
          </button>

          <button type="button" class="icon-btn" :disabled="loadingShelf || loadingItems" title="새로고침" aria-label="새로고침" @click="refreshWithReset">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M4 4v6h6M20 20v-6h-6" stroke="currentColor" fill="none"/>
              <path d="M20 9a7 7 0 00-12-5.2M4 15a7 7 0 0012 5.2" stroke="currentColor" fill="none"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 접이식 필터 패널 -->
      <details class="filter-panel" :open="filtersOpen" @toggle="onToggleFilters">
        <summary>
          <span class="filter-summary">
            {{ filterSummary }}
          </span>
        </summary>

        <div class="filter-panel__grid">
          <!-- 키워드 -->
          <label class="fp-field fp-field--wide">
            <span class="fp-label">키워드</span>
            <input
              class="input input--sm"
              type="search"
              v-model.trim="keyword"
              placeholder="제목/저자 검색"
              @input="onKeywordInput"
              @keyup.enter="onFilterChange"
              aria-label="제목/저자 검색"
            />
          </label>

          <!-- 정렬 기준 -->
          <label class="fp-field">
            <span class="fp-label">정렬 기준</span>
            <select class="select select--sm" v-model="sortSel" @change="onFilterChange" :disabled="loadingShelf || loadingItems" title="정렬 기준">
              <option value="">정렬 기준</option>
              <option value="added">추가일</option>
              <option value="title">제목</option>
              <option value="pages">페이지</option>
            </select>
          </label>

          <!-- 정렬 방식 -->
          <label class="fp-field">
            <span class="fp-label">정렬 방식</span>
            <select class="select select--sm" v-model="orderSel" @change="onFilterChange" :disabled="loadingShelf || loadingItems" title="정렬 방식">
              <option value="">정렬 방식</option>
              <option value="desc">내림차순</option>
              <option value="asc">오름차순</option>
            </select>
          </label>

          <label class="fp-field">
            <span class="fp-label">독서 상태</span>
            <select v-model="statusSel" @change="onFilterChange" class="select select--sm" :disabled="loadingShelf || loadingItems">
              <option value="">전체</option>
              <option value="PLAN">읽기전</option>
              <option value="READING">읽는중</option>
              <option value="DONE">다읽음</option>
            </select>
          </label>

          <label class="fp-field">
            <span class="fp-label">연도</span>
            <select v-model="yearSel" @change="onFilterChange" class="select select--sm" :disabled="loadingShelf || loadingItems">
              <option value="">전체</option>
              <option v-for="y in years" :key="y" :value="String(y)">{{ y }}</option>
            </select>
          </label>

          <label class="fp-field">
            <span class="fp-label">월</span>
            <select v-model="monthSel" @change="onFilterChange" class="select select--sm" :disabled="loadingShelf || loadingItems">
              <option value="">전체</option>
              <option v-for="m in 12" :key="m" :value="String(m)">{{ m }}</option>
            </select>
          </label>
        </div>
      </details>
    </div>
    
    <div v-if="bookshelfId" class="shelf-wrap">
      <template v-if="store.shelfEntries.length">
        <Bookshelf class="shelf--center" :entries="store.shelfEntries" />
        <BookSearchModal ref="searchRef" />
      </template>
      <template v-else>
        <div class="empty-shelf">
          <p class="empty-shelf__title">아직 책장에 책이 없어요.</p>
          <p class="empty-shelf__hint">지금 바로 첫 책을 담아보세요.</p>
          <button class="btn btn--outline-brand" @click="openSearch">책 추가</button>
        </div>
      </template>
    </div>
    
    <BookSearchModal ref="searchRef" />
    <MyInfoModal ref="profileRef" />
    <ReadingStatsModal ref="statsRef" />
    <BooksCalendarModal ref="calendarRef" />

    <div
      v-if="loadingShelf"
      class="overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="overlay__panel">
        <div class="overlay__spinner" aria-hidden="true"></div>
        <p class="overlay__msg">책장 불러오는 중…</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { storeToRefs } from "pinia";

import Bookshelf from "@/components/books/Bookshelf.vue";
import BookSearchModal from "@/components/books/BookSearchModal.vue";
import MyInfoModal from "@/components/user/MyInfoModal.vue";
import ReadingStatsModal from "@/components/books/ReadingStatsModal.vue";
import BooksCalendarModal from "@/components/books/BooksCalendarModal.vue";

import { useShelvesStore } from "@/stores";
import { useAuthStore } from "@/stores";
import { useRouter } from "vue-router";
import { useThemeStore } from "@/stores";
import type { GoalProgress } from "@/types/user";
import type { ReadingStatus, ShelfListOpts } from "@/types/shelf";

const store = useShelvesStore();
const { bookshelfId } = storeToRefs(store);

const loadingShelf = computed(() => store.loading.shelf);
const loadingItems = computed(() => store.loading.items);
const shelfError = computed(() => store.error.shelf);

const readCount = computed(() => store.readCount);
const totalThicknessText = computed(() => `${store.totalThicknessCm.toFixed(1)} cm`);

const auth = useAuthStore();
const router = useRouter();

const userId = computed(() => auth.user?.userId ?? null);

const statusSel = ref<"" | ReadingStatus>("");
const yearSel   = ref<string>(""); // ""=전체
const monthSel  = ref<string>(""); // ""=전체

// 연도 목록(현재연도부터 10년치)
const nowYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => nowYear - i);

const keyword  = ref<string>('');
const sortSel  = ref<'added'|'title'|'pages'|''>('');
const orderSel = ref<'asc'|'desc'|''>('');

let kwTimer: number | undefined;
function onKeywordInput() {
  if (kwTimer) window.clearTimeout(kwTimer);
  kwTimer = window.setTimeout(() => {
    onFilterChange();
  }, 300);
}

// 접이식 필터 패널 상태(로컬 저장)
const filtersOpen = ref(localStorage.getItem("ui.filtersOpen") === "1");
function onToggleFilters(e: Event){
  const open = (e.target as HTMLDetailsElement)?.open ?? false;
  filtersOpen.value = open;
  try { localStorage.setItem("ui.filtersOpen", open ? "1" : "0"); } catch {}
}
// 필터 요약 문자열
const filterSummary = computed(() => {
  const statusMap: Record<string,string> = { PLAN:"읽기전", READING:"읽는중", DONE:"다읽음" };
  const parts:string[] = [];
  parts.push(`독서 상태: ${statusSel.value ? statusMap[statusSel.value] : "전체"}`);
  parts.push(`연도: ${yearSel.value || "전체"}`);
  parts.push(`월: ${monthSel.value || "전체"}`);
  parts.push(`정렬: ${sortSel.value || "기본"} ${orderSel.value || ""}`.trim());
  parts.push(`키워드: ${keyword.value || "—"}`);
  return parts.join(" · ");
});

const statsRef = ref<InstanceType<typeof ReadingStatsModal>|null>(null);
function openStats(){ statsRef.value?.open(); }

const calendarRef = ref<InstanceType<typeof BooksCalendarModal> | null>(null);
function openCalendar() {
  calendarRef.value?.open();
}

const profileRef = ref<InstanceType<typeof MyInfoModal> | null>(null);
const nickname = computed(() => useAuthStore().user?.nickname ?? "");
function openProfile(){ profileRef.value?.open?.(); }

// 테마 토글 관련
const themeStore = useThemeStore();
const themeLabel = computed(() => {
  // 버튼 라벨: Light / Dark / System
  return themeStore.mode === 'light' ? '라이트' : themeStore.mode === 'dark' ? '다크' : '시스템';
});
function toggleTheme() {
  themeStore.toggleCycle();
}

const goalProgress = computed<GoalProgress|null>(() => useAuthStore().goalProgress);
const goalAchieved = computed(() => {
  const g = goalProgress.value;
  return !!(g && typeof g.goal === 'number' && g.goal > 0 && g.done >= g.goal);
});

const searchRef = ref<InstanceType<typeof BookSearchModal> | null>(null);

function openSearch() {
  searchRef.value?.open();
}

function currentFilter(): ShelfListOpts {
  const status = statusSel.value || undefined;
  const year = yearSel.value ? Number(yearSel.value) : undefined;
  const month = monthSel.value ? Number(monthSel.value) : undefined;

  return {
    status, year, month,
    keyword: keyword.value || undefined,
    sort: sortSel.value || undefined,
    order: orderSel.value || undefined,
  };
}

function reload() {
  if (!userId.value) return;
  store.fetchMyShelf(userId.value).then(() => {
    store.fetchShelfItems(currentFilter());
  });
}

async function refreshWithReset() {
  resetFilters();
  await reload();
}

function resetFilters() {
  keyword.value = '';
  sortSel.value = '';
  orderSel.value = '';
  statusSel.value = '';
  yearSel.value = String(nowYear);
  monthSel.value = '';
}

function onFilterChange() {
  store.fetchShelfItems(currentFilter());
}

async function onLogout() {
  const ok = window.confirm("로그아웃 하시겠습니까?");
  if (!ok) return;
  await auth.logout();
  router.replace({ name: 'login' });
}

onMounted(async () => {
  if (!auth.isAuthenticated || !userId.value) {
    router.replace({ name: 'login' });
    return;
  }
  yearSel.value = String(nowYear);
  await reload();
});

onMounted(() => {
  auth.fetchGoalProgress().catch(() => {});
});
</script>

<style scoped>
</style>