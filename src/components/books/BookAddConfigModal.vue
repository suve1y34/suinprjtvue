<template>
  <dialog ref="dlg" class="modal">
    <form method="dialog" class="box" @submit.prevent="onConfirm">
      <header class="head">
        <strong>추가 설정</strong>
        <button @click="close" type="button" aria-label="close" class="btn btn-outline-dark">✕</button>
      </header>
      
      <div v-if="book">
        <div class="meta">
          <div class="t">{{ book.title }}</div>
          <div class="s">
            <span>{{ book.author }}</span>
            <span v-if="pages">{{ pages }}</span>
          </div>
        </div>

        <div class="row">
          <label>
            상태
            <select v-model="status">
              <option value="PLAN">PLAN</option>
              <option value="READING">READING</option>
              <option value="DONE">DONE</option>
            </select>
          </label>
          <label>
            현재 페이지
            <input type="number" v-model.number="currentPage" min="0" :max="pages || undefined" />
          </label>
        </div>
        <div class="actions">
          <button type="submit" class="btn btn-solid-gray" :disabled="false">완료</button>
        </div>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { AladinBook } from "@/types/aladin";

type ReadingStatus = "PLAN" | "READING" | "DONE";

const dlg = ref<HTMLDialogElement | null>(null);
const book = ref<AladinBook | null>(null);
const status = ref<ReadingStatus>("PLAN");
const currentPage = ref<number>(0);

const pages = computed<number | undefined>(() => {
  const b = book.value as any;
  return b ? (b.pages ?? b.itemPage ?? undefined) : undefined;
});

const emit = defineEmits<{
  (e: "confirm", payload: { book: AladinBook; status: ReadingStatus; currentPage: number }): void;
}>();

function open(b: AladinBook) {
  book.value = b;
  status.value = "PLAN";
  currentPage.value = 0;
  dlg.value?.showModal();
}

function close() {
  dlg.value?.close();
  book.value = null;
}

function onConfirm() {
  if (!book.value) return;
  let cp = currentPage.value || 0;
  if (typeof pages.value === "number") {
    cp = Math.max(0, Math.min(cp, pages.value));
  }
  emit("confirm", { book: book.value, status: status.value, currentPage: cp });
  close();
}

defineExpose({ open, close });
</script>

<style scoped>
.modal { border: none; padding: 0; }
.box { width: 480px; max-width: 92vw; padding: 12px; display: grid; gap: 12px; }
.head { display: flex; justify-content: space-between; align-items: center; border-bottom:1px solid #eee; padding-bottom:6px; }
.row { display:flex; gap:12px; align-items:center; }
.meta .t { font-weight: 600; }
.meta .s { font-size: 12px; opacity: 0.8; display:flex; gap:8px; flex-wrap:wrap; }
.actions { display:flex; gap:8px; justify-content:flex-end; }
.btn { padding: 6px 10px; border: 1px solid transparent; border-radius: 6px; font-weight: 600; }
.btn:disabled { opacity: .6; cursor: not-allowed; }
.btn-outline-dark { background: #fff; color: #222; border-color: #222; }
.btn-solid-gray { background: #6b7280; color: #fff; border-color: #6b7280; }
</style>