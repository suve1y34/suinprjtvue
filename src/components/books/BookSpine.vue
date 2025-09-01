<template>
  <div
    class="spine"
    :class="variantClass"
    :style="{ width: widthPx }"
    :title="titleAttr"
    @click="onEditProgress"
  >
    <span class="badge" :class="`badge--${(readingStatus ?? 'PLAN').toLowerCase()}`">
      {{ readingStatus ?? 'PLAN' }}
    </span>
    <span class="spine__title">{{ book.title }}</span>

    <select
      class="status-select"
      :value="readingStatus"
      :disabled="disabled"
      @click.stop
      @change="onChangeStatus"
    >
      <option value="PLAN">PLAN</option>
      <option value="READING">READING</option>
      <option value="DONE">DONE</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import type { Book } from "@/types/book";
import type { ReadingStatus } from "@/types/shelf";
import { computed } from "vue";
import { pagesToWidth } from "@/utils/thickness";

const props = defineProps<{
  book: Book;
  index?: number;
  readingStatus?: ReadingStatus;
  currentPage?: number;
  totalPages?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "change-status", status: ReadingStatus): void;
  (e: "edit-progress", currentPage: number): void;
}>();

const widthPx = computed(() => `${pagesToWidth(props.book.pages)}px`);
const isDark = computed(() => (props.index ?? 0) % 2 === 0);

const titleAttr = computed(() => {
  const tp = props.totalPages ?? props.book.pages;
  const cp = props.currentPage ?? 0;
  const status = props.readingStatus ?? "PLAN";
  return `${props.book.title} — ${cp}${tp ? " / " + tp : ""}p · ${status}`;
});

function onChangeStatus(e: Event) {
  const v = (e.target as HTMLSelectElement).value as ReadingStatus;
  emit("change-status", v);
}

function onEditProgress() {
  if (props.disabled) return;
  const max = props.totalPages ?? props.book.pages;
  const initial = String(props.currentPage ?? 0);
  const input = window.prompt(`현재 페이지 (0${typeof max === "number" ? " ~ " + max : ""})`, initial);
  if (input == null) return;
  const num = Number(input);
  if (!Number.isFinite(num) || num < 0 || (typeof max === "number" && num > max)) {
    alert("유효한 페이지 수를 입력하세요.");
    return;
  }
  emit("edit-progress", num);
}

const variantClass = computed(() => {
  const order = ["spine--dark", "spine--dark-2", "spine--accent", "spine--light"];
  const i = Math.abs(props.index ?? 0) % order.length;
  return order[i];
});
</script>

<style scoped>
</style>