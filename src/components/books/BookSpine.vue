<template>
  <div
    class="spine"
    :class="{ dark: isDark, light: !isDark }"
    :style="{ width: widthPx }"
    :title="titleAttr"
    @click="onEditProgress"
  >
    <span class="badge" :class="`badge--${(readingStatus ?? 'PLAN').toLowerCase()}`">
      {{ readingStatus ?? 'PLAN' }}
    </span>
    <span class="title">{{ book.title }}</span>

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
</script>

<style scoped>
.spine {
  position: relative;          /* 뱃지/셀렉트 위치 기준 */
  height: 180px;
  display: inline-flex;
  vertical-align: bottom;
  align-items: center;
  justify-content: center;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  margin: 0;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.1);
  cursor: pointer;
  user-select: none;
}
.spine.dark { background: #333; color: #f0f0f0; }
.spine.light { background: #bbb; color: #222; }

.title {
  font-size: 12px;
  line-height: 1.1;
  max-height: 92%;
  display: -webkit-box;
  -webkit-line-clamp: 12;
  -webkit-box-orient: vertical;
  white-space: normal;
  overflow: hidden;
}

/* 상태 뱃지 */
.badge{
  position:absolute; top:4px; right:4px;
  font-size:10px; padding:2px 4px; border-radius:3px;
  background:#eee; color:#222; line-height:1;
  pointer-events:none; /* 클릭은 spine으로 전달 */
}
.badge--plan{ background:#e5e7eb; }
.badge--reading{ background:#dbeafe; }
.badge--done{ background:#dcfce7; }

/* 상태 셀렉트: hover 시 보이게 */
.status-select{
  position:absolute; bottom:4px; right:4px;
  font-size:10px; padding:2px 4px;
  opacity:0; transition:opacity .15s ease;
}
.spine:hover .status-select{ opacity:1; }
</style>