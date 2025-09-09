<template>
  <dialog ref="dlg" class="modal modal--lg">
    <form method="dialog" class="modal__box" @submit.prevent>
      <header class="modal__head">
        <strong>도서 검색</strong>
        <button @click="close" type="button" class="btn btn--outline-black" aria-label="close">✕</button>
      </header>

      <div class="form-row searchbar">
        <div class="searchbar__box">
          <input
            v-model.trim="q"
            type="text"
            class="search-input"
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

      <div class="results-grid" v-if="list.length">
        <div class="result-item" v-for="b in list" :key="b.isbn13Code" @click="openDetail(b)">
          <div class="thumb">
            <img :src="coverOf(b)" :alt="b.title" loading="lazy" @error="onImgError" />
          </div>
          <div class="result-meta">
            <div class="t">{{ b.title }}</div>
            <div class="s">
              <span>{{ b.author }}</span>
              <span v-if="(b as any).publisher">{{ (b as any).publisher }}</span>
              <span v-if="(b as any).pubDate">{{ (b as any).pubDate }}</span>
              <span v-if="(b as any).pages">{{ (b as any).pages }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="empty" v-else-if="!loading">검색 결과가 없습니다.</div>
      <div class="loading" v-if="loading">검색 중…</div>
    </form>
  </dialog>
  <BookDetailModal ref="detailRef" @config="openConfig" />
  <BookAddConfigModal ref="configRef" @confirm-add="onConfirmAdd" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { aladinApi } from "@/api/aladin.api";
import { useShelvesStore } from "@/stores/shelves.store";
import type { AladinBook } from "@/types/aladin";
import type { AddPayload } from "@/types/shelf";

import searchHistory from "@/utils/searchHistory";

import BookDetailModal from "./BookDetailModal.vue";
import BookAddConfigModal from "./BookAddConfigModal.vue";

const dlg = ref<HTMLDialogElement | null>(null);
const q = ref("");
const list = ref<AladinBook[]>([]);
const loading = ref(false);

const store = useShelvesStore();
const mutating = computed(() => store.mutating);

function reset(){ q.value = ""; list.value = []; }
function open() { dlg.value?.showModal(); }
function close() { dlg.value?.close(); }
defineExpose({ open, close });

function onDlgClose(){ reset(); }
onMounted(() => { dlg.value?.addEventListener("close", onDlgClose); });
onBeforeUnmount(() => { dlg.value?.removeEventListener("close", onDlgClose); });

// 자식 refs
const detailRef = ref<InstanceType<typeof BookDetailModal> | null>(null);
const configRef = ref<InstanceType<typeof BookAddConfigModal> | null>(null);

function openDetail(b: AladinBook) { detailRef.value?.open(b); }
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
// ▲▲▲ 검색어 히스토리 드롭다운 상태/로직 ▲▲▲

async function onSearch() {
  const keyword = q.value.trim();
  if (!keyword) return;

  loading.value = true;
  try {
    list.value = await aladinApi.search(keyword, 1, 20);

    // ★ DoD: "검색 시 push" — 확정 검색 시 기록 저장
    searchHistory.push(keyword);
    refreshHistory();
    hideDropdownSoon(true); // 검색 후 드롭다운 닫기
  } catch (e: any) {
    alert(e?.message ?? "검색 실패");
  } finally {
    loading.value = false;
  }
}

// 커버 URL 우선순위
function coverOf(b: any): string {
  return b.coverImageUrl || b.coverLargeUrl || b.cover || b.coverSmallUrl || "";
}
function onImgError(e: Event) {
  (e.target as HTMLImageElement).src = ""; // 실패 시 비움(브라우저 기본 깨진이미지 숨김을 기대)
}

async function onConfirmAdd({ book, status, currentPage }: AddPayload) {
  const pages = (book as any).pages ?? (book as any).itemPage ?? undefined;

  try {
    // 1) add(JSON, bookshelfId는 store에서 주입)
    await store.addBookToShelf({
      isbn13Code: (book as any).isbn13Code,
      title: book.title,
      author: book.author,
      pages,
      publisher: (book as any).publisher,
      pubDate: (book as any).pubDate,
      readingStatus: status,
      currentPage
    });

    // 2) 진행도 보정 필요 시 (shelfBookId 모르면 재조회 후 찾기)
    if (currentPage > 0) {
      await store.fetchShelfItems();
      const added = store.shelfItems.find(e =>
        e.book?.isbn13Code === (book as any).isbn13Code
      );
      if (added) {
        // await store.updateProgress(added.shelfBookId, currentPage, pages);
      }
    }

    close(); // 검색 모달 닫기
  } catch (e: any) {
    alert(e?.message ?? "추가 실패");
  }
}
</script>
<style scoped>
</style>