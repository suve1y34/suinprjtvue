<template>
  <div
    class="spine"
    :class="variantClass"
    :style="{ width: widthPx }"
    :title="titleAttr"
    @click="openEdit"
  >
    <span class="badge" :class="badgeClass">
      {{ statusLabel }}
    </span>
    <span class="spine__title">{{ book.title }}</span>
    <span class="spine__progress">{{ percentText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Book } from "@/types/book";
import type { ReadingStatus } from "@/types/shelf";
import { pagesToWidth } from "@/utils/thickness";

const props = defineProps<{
  book: Book;
  index?: number;
  readingStatus?: ReadingStatus;
  currentPage?: number;
  totalPages?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{ (e: "open-edit"): void }>();

const widthPx = computed(() => `${pagesToWidth(props.book.pages)}px`);
const variantClass = computed(() => {
  const order = ["spine--dark", "spine--dark-2", "spine--accent", "spine--light"];
  const i = Math.abs(props.index ?? 0) % order.length;
  return order[i];
});

const tp = computed(() => (typeof props.totalPages === 'number' ? props.totalPages : props.book.pages) || 0);
const cp = computed(() => (typeof props.currentPage === 'number' ? props.currentPage : 0));

const percentValue = computed(() => {
  const total = Math.max(0, tp.value | 0);
  if (!total) return 0;
  const cur = Math.max(0, Math.min(cp.value | 0, total));
  return Math.floor((cur / total) * 100);
});
const percentText = computed(() => (tp.value ? `${percentValue.value}%` : '—%'));

const titleAttr = computed(() => {
  const status = props.readingStatus ?? "PLAN";
  return `${props.book.title} — ${cp.value}${tp.value ? " / " + tp.value : ""}p · ${status}`;
});

const badgeClass = computed(() => {
  const s = (props.readingStatus ?? 'PLAN').toLowerCase(); // plan|reading|done
  return `badge--${s}`;
});

const statusLabel = computed(() => {
  switch (props.readingStatus) {
    case "READING": return "읽는중";
    case "DONE":    return "다읽음";
    default:        return "읽기전";
  }
});

function openEdit() { emit("open-edit"); }
</script>

<style scoped>
</style>
