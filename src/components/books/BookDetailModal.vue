<template>
  <dialog ref="dlg" class="modal modal--md">
    <form method="dialog" class="modal__box" @submit.prevent>
      <header class="modal__box">
        <strong>도서 상세</strong>
        <button @click="close" type="button" aria-label="close" class="btn btn--outline-black">✕</button>
      </header>

      <div v-if="book">
        <div class="result-meta">
          <div class="t">{{ book.title }}</div>
          <div class="s">
            <span>{{ book.author }}</span>
            <span v-if="(book as any).publisher">{{ (book as any).publisher }}</span>
            <span v-if="(book as any).pubDate">{{ (book as any).pubDate }}</span>
            <span v-if="(book as any).pages">{{ (book as any).pages }}p</span>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn--outline-dark" type="button" @click="onConfig">추가 설정...</button>
        </div>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { AladinBook } from '@/types/aladin';

const dlg = ref<HTMLDialogElement | null>(null);
const book = ref<AladinBook | null>(null);

const emit = defineEmits<{ (e: "config", book: AladinBook): void }>();

function open(b: AladinBook) { book.value = b; dlg.value?.showModal(); }
function close() { dlg.value?.close(); book.value = null; }
function onConfig() { if (book.value) emit("config", book.value); }

defineExpose({ open, close });
</script>

<style scoped>
</style>