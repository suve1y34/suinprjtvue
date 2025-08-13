<script setup lang="ts">
import type { Book } from '@/types/book';

const props = defineProps<{ book: Book; loading?: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

/** pub_date를 보기 좋게 포맷 */
function formatDate(date?: string) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center" @click.self="emit('close')">
    <div class="bg-white rounded-xl p-5 w-[560px] max-w-[90vw]">
      <header class="flex justify-between items-center mb-3">
        <h2 class="font-bold text-lg">{{ book.title }}</h2>
        <button class="border rounded px-3 py-1" @click="emit('close')">닫기</button>
      </header>

      <div class="text-sm text-gray-600 mb-2">
        {{ book.author }}
      </div>

      <div v-if="loading">불러오는 중…</div>
      <template v-else>
        <ul class="text-sm space-y-1">
          <li><strong>총 페이지 수:</strong> {{ book.pages ?? '-' }}</li>
          <li><strong>출판사:</strong> {{ book.publisher ?? '-' }}</li>
          <li><strong>출간일:</strong> {{ formatDate(book.pubDate) }}</li>
        </ul>
      </template>
    </div>
  </div>
</template>
