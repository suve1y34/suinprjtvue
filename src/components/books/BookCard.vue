<script setup lang="ts">
import type { Book } from '@/types/book';
import { computed } from 'vue';

const props = defineProps<{ book: Book; index: number }>(); // index로 색상 번갈이
const emit = defineEmits<{ (e: 'click'): void }>();

// 페이지 수 → 책등 두께(px)
const thickness = computed(() => {
  const pages = props.book.pages ?? 240;
  const px = 8 + (pages / 240) * 10;
  return Math.max(8, Math.min(40, Math.round(px)));
});

// 색상: 짝수/홀수 인덱스 번갈이
const spineColor = computed(() => {
  return props.index % 2 === 0 ? '#555555' : '#cccccc'; // 진한회색 / 연한회색
});

// 키보드 접근성
function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    emit('click');
  }
}
</script>

<template>
  <article
    class="book-spine"
    :style="{
      width: thickness + 'px',
      background: spineColor
    }"
    role="button"
    tabindex="0"
    @click="emit('click')"
    @keydown="onKey"
    :title="book.title"
  >
    <div class="spine-inner">
      <div class="spine-title">{{ book.title }}</div>
    </div>
  </article>
</template>

<style scoped>
.book-spine {
  height: 220px;
  border: 1px solid rgba(0,0,0,0.1);
  display: inline-flex;
  vertical-align: bottom;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0;                /* ✅ 간격 완전 제거 */
  cursor: pointer;
}
.spine-inner {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  height: 100%;
}
.spine-title {
  font-weight: 700;
  font-size: 12px;
  color: #000;
  max-height: 90%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 12;
  -webkit-box-orient: vertical;
}
</style>
