<template>
  <section class="page">
    <header class="page__toolbar form-row">
      <input
        v-model="input"
        placeholder="검색어를 입력하세요"
      />
      <button class="bbtn btn--outline-black" @click="onSearchClick" :disabled="loading">
        {{ loading ? '검색중..' : '검색' }}
      </button>
      <button class="btn btn--solid-gray" @click="store.clear()" :disabled="loading">초기화</button>
    </header>

      <p v-if="error" class="state state--error">{{ error }}</p>
      <p v-if="!loading && results.length === 0 && keyword" class="state">검색 결과가 없습니다.</p>

      <ul v-if="results.length" class="results-grid">
        <li v-for="b in results" :key="b.isbn13Code" class="result-item">
          <div class="result-meta">
            <div class="t">{{ b.title }}</div>
            <div class="s">
              <div class="isbn">{{ b.isbn13Code }}</div>
              <span>{{ b.author }}</span>
              <span v-if="b.publisher">{{ b.publisher }}</span>
              <span v-if="b.pubDate">{{ b.pubDate }}</span>
              <span v-if="b.pages">{{ b.pages }}</span>
            </div>
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
</style>