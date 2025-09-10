<template>
  <section class="memo-section">
    <header class="memo-head">
      <strong>공개 메모</strong>
      <span class="memo-count" v-if="items.length">({{ items.length }}개+)</span>
    </header>

    <ul class="memo-list" v-if="items.length">
      <li
        v-for="(m, idx) in items"
        :key="m.shelfBookId ?? `${m.nickname}-${m.addedDatetime}-${idx}`"
        class="memo-item"
      >
        <div class="memo-meta">
          <span class="memo-nick">{{ m.nickname }}</span>
          <span class="memo-dot">·</span>
          <span class="memo-date">{{ m.addedDatetime }}</span>
        </div>
        <p class="memo-body">{{ m.memo }}</p>
      </li>
    </ul>

    <div class="memo-empty" v-else>아직 작성된 메모가 없어요.</div>

    <div class="memo-more" v-if="hasMore">
      <button class="btn btn--outline-black" :disabled="loading" @click="loadMore">
        {{ loading ? '불러오는 중…' : '더 보기' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { booksApi, type PublicMemo } from "@/api/books.api";

const props = defineProps<{
  bookId?: number;
  isbn13Code?: string;
  pageSize?: number;
}>();

const items = ref<PublicMemo[]>([]);
const page = ref(1);
const size = ref(props.pageSize ?? 10);
const hasMore = ref(false);
const loading = ref(false);

async function fetchPage(p = 1) {
  loading.value = true;
  try {
    const res = await booksApi.listPublicMemos({
      bookId: props.bookId,
      isbn13Code: props.isbn13Code,
      page: p,
      size: size.value,
    });
    if (p === 1) items.value = res.items;
    else items.value = items.value.concat(res.items);

    page.value = res.page;
    size.value = res.size;
    hasMore.value = res.hasMore;
  } catch (e) {
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (!loading.value) fetchPage(page.value + 1);
}

onMounted(() => fetchPage(1));
watch(() => [props.bookId, props.isbn13Code].join(":"), () => fetchPage(1));
</script>