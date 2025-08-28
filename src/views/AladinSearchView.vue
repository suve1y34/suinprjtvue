<template>
    <section class="p-4 max-w-fxl mx-auto">
        <header class="flex items-center gap-2 mb-4">
            <input
                v-model="input"
                class="border rounded px-3 py-2 flex-1"
                placeholder="검색어를 입력하세요"
            />
            <button class="border rounded px-4 py-2" @click="onSearchClick" :disabled="loading">
                {{ loading ? '검색중..' : '검색' }}
            </button>
            <button class="border rounded px-3 py-2" @click="store.clear()" :disabled="loading">초기화</button>
        </header>

        <p v-if="error" class="text-red-600 mb-2">{{ error }}</p>
        <p v-if="!loading && results.length === 0 && keyword" class="text-gray-600">검색 결과가 없습니다.</p>

        <ul v-if="results.length" class="space-y-2">
            <li v-for="b in results" :key="b.isbn13Code" class="border rounded p-3">
                <div class="text-sm text-gray-500">{{ b.isbn13Code }}</div>
                <div class="font-semibold">{{ b.title }}</div>
                <div class="text-sm">{{ b.author }}</div>
                <div class="text-xs text-gray-600">
                    <span v-if="b.publisher">{{ b.publisher }}</span>
                    <span v-if="b.pubDate">{{ b.pubDate }}</span>
                    <span v-if="b.pages">{{ b.pages }}</span>
                </div>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAladinStore } from '@/stores/aladin.store';

const store = useAladinStore();
const { keyword, results, loading, error } = storeToRefs(store);

const input = ref(store.keyword);

let timer: number | undefined;
watch(input, (v) => {
  store.keyword = v;
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    store.search(v);
  }, 300);
});

function onSearchClick() { if (timer) window.clearTimeout(timer); store.search(input.value); }
</script>
<style scoped>
.space-y-2 > * + * { margin-top: .5rem; }
</style>