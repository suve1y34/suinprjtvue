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
.spine { height: 180px; display: flex; align-items: center; justify-content: center; writing-mode: vertical-rl; text-orientation: mixed; margin: 0; border-radius: 2px; overflow: hidden; }
.spine.dark { background: #333; color: #f0f0f0; }
.spine.light { background: #bbb; color: #222; }
.title { font-size: 12px; line-height: 1.1; white-space: nowrap; }
</style>