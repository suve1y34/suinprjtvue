<template>
  <dialog ref="dlg" class="modal modal--md">
    <form method="dialog" class="modal__box" @submit.prevent>
      <header class="modal__head">
        <strong>도서 상세</strong>
        <button @click="close" type="button" aria-label="close" class="btn btn--outline-black">✕</button>
      </header>

      <div v-if="book">
        <div class="book-head">
          <div class="cover" v-if="coverUrl">
            <img :src="coverUrl" :alt="book.title" @error="onImgError" />
          </div>
          <div class="meta">
            <div class="title-row-fixed">
              <h3 class="book-title">{{ book.title }}</h3>
              <button
                v-if="!added"
                class="btn btn--outline-dark btn--sm"
                type="button"
                @click="onConfig"
              >
                내 책장에 추가
              </button>
              <span v-else class="already-tip">이미 내 책장에 있어요</span>
            </div>
            <div class="book-author" v-if="book.author">{{ book.author }}</div>
            <div class="book-pages" v-if="(book as any).pages">{{ (book as any).pages }}p</div>
          </div>
        </div>

        <PublicReviewList
          class="mt-8"
          :isbn13-code="(book as any).isbn13Code"
        />
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { AladinBook } from '@/types/aladin';
import PublicReviewList from './PublicReviewList.vue';

const dlg = ref<HTMLDialogElement | null>(null);
const book = ref<AladinBook | null>(null);

const added = ref(false);

const emit = defineEmits<{ (e: "config", book: AladinBook): void }>();

function open(b: AladinBook, opts?: { isAdded?: boolean }) {
  book.value = b;
  added.value = !!opts?.isAdded;
  dlg.value?.showModal();
}
function close() { dlg.value?.close(); book.value = null; }
function onConfig() { if (book.value) emit("config", book.value); }

const coverUrl = computed<string | undefined>(() => {
  const b: any = book.value || {};
  return b.coverImageUrl || b.coverLargeUrl || b.cover || b.coverSmallUrl || undefined;
});
function onImgError(e: Event) {
  (e.target as HTMLImageElement).style.display = "none";
}

defineExpose({ open, close });
</script>

<style scoped>
</style>