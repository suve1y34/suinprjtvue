<template>
  <section class="memo-section">
    <header class="memo-head">
      <strong>리뷰</strong>
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
        <p
          class="memo-body"
          :class="{ 'is-expanded': isExpanded(itemKey(m, idx)) }"
        >
          {{ m.review }}
        </p>

        <div class="memo-toggle" v-if="isLong(m.review)">
          <button
            type="button"
            class="btn-link"
            @click="toggleExpand(itemKey(m, idx))"
          >
            {{ isExpanded(itemKey(m, idx)) ? '접기' : '더 보기' }}
          </button>
        </div>
      </li>
    </ul>

    <div class="memo-empty" v-else>아직 작성된 리뷰가 없어요.</div>

    <div class="memo-more" v-if="hasMore">
      <button class="btn btn--outline-black" :disabled="loading" @click="loadMore">
        {{ loading ? '불러오는 중…' : '더 보기' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { booksApi } from "@/api/books.api";
import type { PublicReivew } from "@/types/book";

const props = defineProps<{
  bookId?: number;
  isbn13Code?: string;
  pageSize?: number;
}>();

const items = ref<PublicReivew[]>([]);
const nextCursor = ref<number | null>(null);
const size = ref(props.pageSize ?? 10);
const loading = ref(false);

// ===== 펼침 상태 관리 =====
const expanded = ref<Set<string>>(new Set());

// 아이템 키(고유/안전)
function itemKey(m: PublicReivew, idx: number): string {
  return String(m.shelfBookId ?? `${m.nickname}-${m.addedDatetime}-${idx}`);
}
function isExpanded(key: string): boolean {
  return expanded.value.has(key);
}
function toggleExpand(key: string) {
  if (expanded.value.has(key)) {
    expanded.value.delete(key);
  } else {
    expanded.value.add(key);
  }
  // 참조형 Set 변경을 Vue가 감지하도록 재할당
  expanded.value = new Set(expanded.value);
}

// 길이 기준(문자 수) — 필요 시 조절 가능
const LONG_THRESHOLD = 140;
function isLong(text?: string | null): boolean {
  const s = (text ?? "").trim();
  return s.length > LONG_THRESHOLD;
}

// nextCursor 존재 여부로 더보기 표시
const hasMore = computed(() => nextCursor.value !== null);

async function fetchFirst() {
  // bookId, isbn13 둘 다 없으면 호출 안 함
  if (!props.bookId && !props.isbn13Code) {
    items.value = [];
    nextCursor.value = null;
    return;
  }

  loading.value = true;
  try {
    const res = await booksApi.listPublicReviews({
      bookId: props.bookId,
      isbn13Code: props.isbn13Code,
      cursor: null,        // 최초 조회는 null
      size: size.value,
    });
    items.value = res.items ?? [];
    nextCursor.value = res.nextCursor ?? null;
    size.value = res.size ?? size.value;
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (!hasMore.value || loading.value) return;

  loading.value = true;
  try {
    const res = await booksApi.listPublicReviews({
      bookId: props.bookId,
      isbn13Code: props.isbn13Code,
      cursor: nextCursor.value, // 다음 커서로 조회
      size: size.value,
    });
    items.value = items.value.concat(res.items ?? []);
    nextCursor.value = res.nextCursor ?? null;
    size.value = res.size ?? size.value;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchFirst);
watch(
  () => [props.bookId, props.isbn13Code, props.pageSize].join(":"),
  () => {
    size.value = props.pageSize ?? 10;
    fetchFirst();
  }
);
</script>