<template>
  <dialog ref="dlg" class="modal">
    <form method="dialog" class="box" @submit.prevent>
      <header class="head">
        <strong>도서 검색</strong>
        <button @click="close" type="button" aria-label="close">✕</button>
      </header>

      <div class="row">
        <input v-model.trim="q" type="text" placeholder="검색 키워드 입력(제목/저자)" @keyup.enter="onSearch"/>
        <button type="button" @click="onSearch" :disabled="loading">검색</button>
      </div>

      <div class="results" v-if="list.length">
        <div class="item" v-for="b in list" :key="b.isbn13Code">
          <div class="meta">
            <div class="t">{{ b.title }}</div>
            <div class="s">
              <span>{{ b.author }}</span>
              <span v-if="b.publisher">{{ b.publisher }}</span>
              <span v-if="b.pubDate">{{ b.pubDate }}</span>
              <span v-if="b.pages">{{ b.pages }}</span>
            </div>
          </div>
          <button
              class="add"
              :disabled="mutating"
              @click="onAdd(b)"
              type="button"
              title="책장에 추가"
          >추가</button>
        </div>
      </div>
      <div class="empty" v-else-if="!loading">검색 결과가 없습니다.</div>
      <div class="loading" v-if="loading">검색 중…</div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { aladinApi } from "@/api/aladin.api";
import { useShelvesStore } from "@/stores/shelves.store";
import type { AladinBook } from "@/types/aladin";

const dlg = ref<HTMLDialogElement | null>(null);
const q = ref("");
const list = ref<AladinBook[]>([]);
const loading = ref(false);

const store = useShelvesStore();
const mutating = computed(() => store.mutating);

function open() { dlg.value?.showModal(); }
function close() { dlg.value?.close(); }
defineExpose({ open, close });

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

function onAdd(b: AladinBook) {
  const pages = (b as any).pages ?? (b as any).itemPage ?? undefined;

  store.addBookToShelf({
    isbn13Code: (b as any).isbn13Code,
    title: b.title,
    author: b.author,
    pages,
    publisher: (b as any).publisher,
    pubDate: (b as any).pubDate,
  })
  .then(() => close())
  .catch((e: any) => alert(e?.message ?? "추가 실패"));
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
.meta .s { font-size: 12px; opacity: 0.8; }
.add { padding: 6px 10px; }
.loading, .empty { font-size: 14px; opacity: 0.8; }
</style>