<template>
  <dialog ref="dlg" class="modal">
    <form method="dialog" class="box" @submit.prevent>
      <header class="head">
        <strong>도서 검색</strong>
        <button @click="close" type="button" class="btn btn-outline-dark" aria-label="close">✕</button>
      </header>

      <div class="row">
        <input v-model.trim="q" type="text" placeholder="검색 키워드 입력(제목/저자)" @keyup.enter="onSearch"/>
        <button type="button" @click="onSearch" :disabled="loading" class="btn btn-outline-dark">검색</button>
      </div>

      <div class="results" v-if="list.length">
        <div class="item" v-for="b in list" :key="b.isbn13Code" @click="openDetail(b)">
          <div class="meta">
            <div class="t">{{ b.title }}</div>
            <div class="s">
              <span>{{ b.author }}</span>
              <span v-if="(b as any).publisher">{{ (b as any).publisher }}</span>
              <span v-if="(b as any).pubDate">{{ (b as any).pubDate }}</span>
              <span v-if="(b as any).pages">{{ (b as any).pages }}</span>
            </div>
          </div>
          <button
            class="btn btn-outline-dark add"
            :disabled="mutating"
            @click.stop="openConfig(b)"
            type="button"
            title="책장에 추가"
          >추가</button>
        </div>
      </div>
      <div class="empty" v-else-if="!loading">검색 결과가 없습니다.</div>
      <div class="loading" v-if="loading">검색 중…</div>
    </form>
  </dialog>
  <BookDetailModal ref="detailRef" @config="openConfig" />
  <BookAddConfigModal ref="configRef" @confirm="onConfirmAdd" />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { aladinApi } from "@/api/aladin.api";
import { useShelvesStore } from "@/stores/shelves.store";
import type { AladinBook } from "@/types/aladin";

import BookDetailModal from "./BookDetailModal.vue";
import BookAddConfigModal from "./BookAddConfigModal.vue";

const dlg = ref<HTMLDialogElement | null>(null);
const q = ref("");
const list = ref<AladinBook[]>([]);
const loading = ref(false);

const store = useShelvesStore();
const mutating = computed(() => store.mutating);

function open() { dlg.value?.showModal(); }
function close() { dlg.value?.close(); }
defineExpose({ open, close });

// 자식 refs
const detailRef = ref<InstanceType<typeof BookDetailModal> | null>(null);
const configRef = ref<InstanceType<typeof BookAddConfigModal> | null>(null);

function openDetail(b: AladinBook) { detailRef.value?.open(b); }
function openConfig(b: AladinBook) { configRef.value?.open(b); }

async function onSearch() {
  if (!q.value) return;
  loading.value = true;
  try {
    list.value = await aladinApi.search(q.value, 1, 20);
  } catch (e: any) {
    alert(e?.message ?? "검색 실패");
  } finally {
    loading.value = false;
  }
}

async function onConfirmAdd({ book, status, currentPage }: { book: AladinBook; status: "PLAN"|"READING"|"DONE"; currentPage: number }) {
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
      ReadingStatus: status,
    });

    // 2) 진행도 보정 필요 시 (shelfBookId 모르면 재조회 후 찾기)
    if (currentPage > 0) {
      await store.fetchShelfItems();
      const added = store.shelfItems.find(e =>
        e.book?.isbn13Code === (book as any).isbn13Code
      );
      if (added) {
        await store.updateProgress(added.shelfBookId, currentPage, pages);
      }
    }

    close(); // 검색 모달 닫기
  } catch (e: any) {
    alert(e?.message ?? "추가 실패");
  }
}
</script>
<style scoped>
.modal { border: none; padding: 0; }
.box { width: 680px; max-width: 92vw; padding: 12px; display: grid; gap: 12px; }
.head { display: flex; justify-content: space-between; align-items: center; }
.row { display: flex; gap: 8px; }
.results { display: grid; gap: 8px; max-height: 60vh; overflow: auto; }
.item { display: flex; justify-content: space-between; gap: 12px; align-items: center; padding: 8px; border: 1px solid #eee; border-radius: 8px; }
.meta .t { font-weight: 600; }
.meta .s { font-size: 12px; opacity: 0.8; display:flex; gap:8px; flex-wrap:wrap; }
.add { padding: 6px 10px; }
.loading, .empty { font-size: 14px; opacity: 0.8; }

/* 버튼 기본 스타일(전역 없을 경우 대비) */
.btn { padding: 6px 10px; border: 1px solid transparent; border-radius: 6px; font-weight: 600; }
.btn:disabled { opacity: .6; cursor: not-allowed; }
.btn-outline-dark { background: #fff; color: #222; border-color: #222; }
</style>