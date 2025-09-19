<template>
  <dialog ref="dlg" class="modal modal--lg">
    <form method="dialog" class="modal__box" @submit.prevent>
      <header class="modal__head">
        <strong>도서 검색</strong>
        <button @click="close" type="button" class="btn btn--outline-black" aria-label="close">✕</button>
      </header>

      <div class="modal__content form-row searchbar">
        <div class="searchbar__box">
          <input
            v-model.trim="q"
            type="text"
            class="input search-input"
            placeholder="검색 키워드 입력(제목/저자)"
            @keyup.enter="onSearch"
            @focus="onFocus"
            @input="onInput"
            @blur="onBlur"
            ref="inputEl"
          />
          <ul
            v-if="showDropdown"
            class="searchbar__dropdown"
          >
            <li v-if="!histories.length" class="searchbar__empty">최근 검색어가 없습니다</li>

            <li
              v-for="(h, i) in histories"
              :key="i"
              class="searchbar__item"
              @mousedown.prevent="onPickHistory(h)"
              title="클릭하여 검색"
            >
              {{ h }}
            </li>

            <li v-if="histories.length" class="searchbar__footer">
              <button type="button" class="link-clear" @mousedown.prevent="onClearHistory">
                기록 모두 지우기
              </button>
            </li>
          </ul>
        </div>
        
        <button type="button" @click="onSearch" :disabled="loading" class="btn btn--outline-black">검색</button>
      </div>

      <!-- 결과 영역(최대 높이 + 내부 스크롤) -->
      <div class="results-wrap">
        <div class="results-grid" v-if="list.length">
          <div class="result-item" v-for="b in list" :key="b.isbn13Code || b.title + b.author" @click="openDetail(b)">
            <div class="thumb">
              <img :src="coverOf(b)" :alt="b.title" loading="lazy" @error="onImgError" />
            </div>
            <div class="result-meta">
              <div class="t">{{ b.title }}</div>
              <div class="s">
                <span>{{ b.author }}</span>
                <span v-if="(b as any).publisher"> · {{ (b as any).publisher }}</span>
                <span v-if="(b as any).pubDate"> · {{ (b as any).pubDate }}</span>
                <span v-if="(b as any).pages"> · {{ (b as any).pages }}p</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 빈 상태: 상하좌우 중앙정렬 -->
        <div class="empty centered" v-else-if="!loading">검색 결과가 없습니다.</div>

        <!-- 로딩 상태: 상하좌우 중앙정렬 -->
        <div class="loading centered" v-if="loading">검색 중…</div>
      </div>

      <!-- 더 보기 버튼(페이지네이션) -->
      <div class="loadmore" v-if="!loading && hasMore">
        <button type="button" class="btn btn--outline-black" @click="loadMore" :disabled="loading">더 보기</button>
      </div>
    </form>
  </dialog>
  <BookDetailModal ref="detailRef" @config="openConfig" />
  <BookAddConfigModal ref="configRef" @confirm-add="onConfirmAdd" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { aladinApi } from "@/api/aladin.api";
import { useShelvesStore } from "@/stores";
import type { AladinBook } from "@/types/aladin";
import type { AddPayload, ReadingStatus } from "@/types/shelf";

import searchHistory from "@/utils/searchHistory";

import BookDetailModal from "./BookDetailModal.vue";
import BookAddConfigModal from "./BookAddConfigModal.vue";

const dlg = ref<HTMLDialogElement | null>(null);
const q = ref("");
const list = ref<AladinBook[]>([]);
const loading = ref(false);

// 페이지네이션 상태
const page = ref(1);
const size = ref(20);
const hasMore = ref(false);

const store = useShelvesStore();
const mutating = computed(() => store.mutating);

function reset() {
  q.value = "";
  list.value = [];
  page.value = 1;
  hasMore.value = false;
}
function open() { dlg.value?.showModal(); }
function close() { dlg.value?.close(); }
defineExpose({ open, close });

function onDlgClose(){ reset(); }
onMounted(() => { dlg.value?.addEventListener("close", onDlgClose); });
onBeforeUnmount(() => { dlg.value?.removeEventListener("close", onDlgClose); });

// 자식 refs
const detailRef = ref<InstanceType<typeof BookDetailModal> | null>(null);
const configRef = ref<InstanceType<typeof BookAddConfigModal> | null>(null);

function openDetail(b: AladinBook) {
  const code = (b as any).isbn13Code ?? (b as any).isbn13 ?? "";
  const t = (b.title ?? "").trim().toLowerCase();
  const a = (b.author ?? "").trim().toLowerCase();

  const already = store.shelfItems.some(i => {
    const ib = i.book || {};
    console.log(ib)
    // 1) ISBN 우선 비교
    if (code && (ib.isbn13Code ?? "").trim() === code) return true;
    // 2) ISBN 없으면 제목+저자 느슨 비교
    const tt = (ib.title ?? "").trim().toLowerCase();
    const aa = (ib.author ?? "").trim().toLowerCase();
    return !code && !!t && !!a && tt === t && aa === a;
  });

  console.log('already', already)

  // 두 번째 인자로 플래그 전달
  detailRef.value?.open(b, { isAdded: already });
}

function openConfig(b: AladinBook) {
  configRef.value?.openFromSearch(b);
}

const inputEl = ref<HTMLInputElement | null>(null);
const showDropdown = ref(false);
const histories = ref<string[]>([]);
let hideTimer: number | undefined;

function refreshHistory() {
  histories.value = searchHistory.list();
}

function onFocus() {
  refreshHistory();
  showDropdown.value = true;
}

function onInput() {
  refreshHistory();
  showDropdown.value = true;
}

function onBlur() {
  // 드롭다운 항목 클릭(mousedown)과 충돌 방지 위해 약간 지연 후 닫기
  hideDropdownSoon();
}

function hideDropdownSoon(force = false) {
  if (hideTimer) window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    showDropdown.value = !force && document.activeElement === inputEl.value;
    if (force) showDropdown.value = false;
  }, 100);
}

function onPickHistory(h: string) {
  q.value = h;
  nextTick(() => onSearch());
}

function onClearHistory() {
  searchHistory.clear();
  refreshHistory();
  showDropdown.value = true; // 남겨서 "없음" 메시지 보이게
}

async function onSearch() {
  const keyword = q.value.trim();
  if (!keyword) return;

  loading.value = true;
  try {
    list.value = await aladinApi.search(keyword, 1, 20);

    // DoD: "검색 시 push" — 확정 검색 시 기록 저장
    searchHistory.push(keyword);
    refreshHistory();
    hideDropdownSoon(true); // 검색 후 드롭다운 닫기
  } catch (e: any) {
    alert(e?.message ?? "검색 실패");
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  try {
    page.value += 1;
    const res = await aladinApi.search(q.value.trim(), page.value, size.value);
    if (Array.isArray(res) && res.length > 0) {
      list.value = list.value.concat(res);
      hasMore.value = res.length >= size.value;
    } else {
      hasMore.value = false;
    }
  } catch (e: any) {
    alert(e?.message ?? "추가 로드 실패");
  } finally {
    loading.value = false;
  }
}

// 커버 URL 우선순위
function coverOf(b: any): string {
  return b.coverImageUrl || b.coverLargeUrl || b.cover || b.coverSmallUrl || "";
}
function onImgError(e: Event) {
  (e.target as HTMLImageElement).src = "";
}

async function onConfirmAdd(p: AddPayload): Promise<void> {
  const { book, status, currentPage, memo, memoVisibility, review, reviewVisibility, startDate, endDate } = p;
  const pages = (book as any).pages ?? (book as any).itemPage ?? undefined;

  const deriveStatus = (cp: number, total?: number): ReadingStatus => {
    if (typeof total === "number") {
      if (cp >= total) return "DONE";
      if (cp > 0)      return "READING";
      return "PLAN";
    }
    return cp > 0 ? "READING" : "PLAN";
  };

  try {
    await store.addBookToShelf({
      isbn13Code: (book as any).isbn13Code,
      title: book.title,
      author: book.author,
      pages,
      publisher: (book as any).publisher,
      pubDate: (book as any).pubDate,
      readingStatus: status,
      currentPage,
      startDate,
      endDate,
      memo: memo ?? undefined,
      memoVisibility: memoVisibility ?? "PRIVATE",
      review: review ?? null,
      reviewVisibility: reviewVisibility ?? "PRIVATE",
    }); 

    if (currentPage > 0) {
      await store.fetchShelfItems();
      const added = store.shelfItems.find(e =>
        e.book?.isbn13Code === (book as any).isbn13Code
      );
      if (added) {
        const nextStatus = deriveStatus(currentPage, pages);
        await store.updateShelfItem({
          shelfBookId: added.shelfBookId,
          currentPage,
          readingStatus: nextStatus,
        });
      }
    }

    try { configRef.value?.close?.(); } catch {}
    try { detailRef.value?.close?.(); } catch {}
    close(); // 검색 모달 닫기
  } catch (e: any) {
    alert(e?.message ?? "추가 실패");
  }
}
</script>
<style scoped>
</style>