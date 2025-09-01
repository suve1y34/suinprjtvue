<template>
  <dialog ref="dlg" class="modal modal--lg">
    <form method="dialog" class="modal__box" @submit.prevent>
      <header class="modal__head">
        <strong>도서 검색</strong>
        <button @click="close" type="button" class="btn btn--outline-black" aria-label="close">✕</button>
      </header>

      <div class="form-row">
        <input v-model.trim="q" type="text" placeholder="검색 키워드 입력(제목/저자)" @keyup.enter="onSearch"/>
        <button type="button" @click="onSearch" :disabled="loading" class="btn btn--outline-black">검색</button>
      </div>

      <div class="results-grid" v-if="list.length">
        <div class="result-item" v-for="b in list" :key="b.isbn13Code" @click="openDetail(b)">
          <div class="result-meta">
            <div class="t">{{ b.title }}</div>
            <div class="s">
              <span>{{ b.author }}</span>
              <span v-if="(b as any).publisher">{{ (b as any).publisher }}</span>
              <span v-if="(b as any).pubDate">{{ (b as any).pubDate }}</span>
              <span v-if="(b as any).pages">{{ (b as any).pages }}</span>
            </div>
          </div>
          <button
            class="btn btn--outline-black add"
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
      readingStatus: status,
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
</style>