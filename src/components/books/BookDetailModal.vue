<template>
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
.modal { border: none; padding: 0; }
.box { width: 600px; max-width: 92vw; padding: 12px; display: grid; gap: 12px; }
.head { display: flex; justify-content: space-between; align-items: center; border-bottom:1px solid #eee; padding-bottom:6px; }
.meta .t { font-weight: 600; }
.meta .s { font-size: 12px; opacity: 0.8; display:flex; gap:8px; flex-wrap:wrap; }
.actions { display:flex; justify-content:flex-end; }
.btn { padding: 6px 10px; border: 1px solid transparent; border-radius: 6px; font-weight: 600; }
.btn:disabled { opacity: .6; cursor: not-allowed; }
.btn-outline-dark { background: #fff; color: #222; border-color: #222; }
</style>