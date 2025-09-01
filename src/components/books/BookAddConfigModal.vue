<template>
  <dialog ref="dlg" class="modal modal--sm">
    <form method="dialog" class="modal__box" @submit.prevent="onConfirm">
      <header class="modal__head">
        <strong>추가 설정</strong>
        <button @click="close" type="button" aria-label="close" class="btn btn--outline-black">✕</button>
      </header>
      
      <div v-if="book">
        <div class="result-meta">
          <div class="t">{{ book.title }}</div>
          <div class="s">
            <span>{{ book.author }}</span>
            <span v-if="pages">{{ pages }}</span>
          </div>
        </div>

        <div class="form-row">
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
        <div class="modal__actions">
          <button type="submit" class="btn btn--solid-gray" :disabled="false">완료</button>
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
</style>