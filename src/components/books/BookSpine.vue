<template>
  <div
    class="spine"
    :class="variantClass"
    :style="{ width: widthPx }"
    :title="titleAttr"
    @click="openEdit"
  >
    <span class="badge" :class="`badge--${(readingStatus ?? 'PLAN')}`">
      {{ statusLabel }}
    </span>
    <span class="spine__title">{{ book.title }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Book } from "@/types/book";
import { pagesToWidth } from "@/utils/thickness";

type ReadingStatus = "PLAN" | "READING" | "DONE";

const props = defineProps<{
  book: Book;
  index?: number;
  readingStatus?: ReadingStatus;
  currentPage?: number;
  totalPages?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "open-edit"): void;
}>();

const widthPx = computed(() => `${pagesToWidth(props.book.pages)}px`);
const variantClass = computed(() => {
  const order = ["spine--dark", "spine--dark-2", "spine--accent", "spine--light"];
  const i = Math.abs(props.index ?? 0) % order.length;
  return order[i];
});

const titleAttr = computed(() => {
  const tp = props.totalPages ?? props.book.pages;
  const cp = props.currentPage ?? 0;
  const status = props.readingStatus ?? "PLAN";
  return `${props.book.title} — ${cp}${tp ? " / " + tp : ""}p · ${status}`;
});

const statusLabel = computed(() => {
  switch (props.readingStatus) {
    case "READING": return "읽는중";
    case "DONE":    return "다읽음";
    default:        return "읽기전";
  }
});

function openEdit(e: Event){
  emit("open-edit");
}
</script>

<style scoped>
</style>