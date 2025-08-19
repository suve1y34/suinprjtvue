<template>
  <div
    class="spine"
    :class="{ dark: isDark, light: !isDark }"
    :style="{ width: widthPx }"
    :title="book.title"
  >
    <span class="title">{{ book.title }}</span>
  </div>
</template>

<script setup lang="ts">
import type { Book } from "@/types/book";
import { computed } from "vue";
import { pagesToWidth } from "@/utils/thickness";

const props = defineProps<{ book: Book; index?: number }>();

const widthPx = computed(() => `${pagesToWidth(props.book.pages)}px`);
const isDark = computed(() => (props.index ?? 0) % 2 === 0);
</script>

<style scoped>
.spine {
  height: 180px;
  display: inline-flex;        /* 가로 나열 */
  vertical-align: bottom;      /* 밑면 정렬 */
  align-items: center;
  justify-content: center;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  margin: 0;                   /* 간격 없음 */
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
  -webkit-line-clamp: 12;      /* 세로 제목 말줄임 */
  -webkit-box-orient: vertical;
  white-space: normal;
  overflow: hidden;
}
</style>