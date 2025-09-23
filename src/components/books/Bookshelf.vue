<template>
  <div class="shelf shelf--tight shelf--wood shelf--center" role="list">
    <!-- 로딩 시 스켈레톤 -->
    <template v-if="isLoading">
      <div class="shelf__cell" v-for="n in skeletonCount" :key="'sk-'+n" role="presentation">
        <BookSpineSkeleton />
      </div>
    </template>

    <BookSpine
      v-for="(entry, i) in entries"
      :key="entry.shelfBookId"
      :shelf-book-id="entry.shelfBookId"
      :book="entry.book"
      :index="i"
      role="listitem"
      :reading-status="entry.readingStatus"
      :current-page="entry.currentPage"
      :total-pages="entry.book?.pages ?? undefined"
      :disabled="mutating"
      @open-edit="onOpenEdit(entry)"
    />
  </div>

  <BookAddConfigModal ref="editRef" @confirm-edit="onConfirmEdit" />
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import { useShelvesStore } from "@/stores";
import BookSpine from "./BookSpine.vue";
import BookAddConfigModal from "./BookAddConfigModal.vue";
import type { ShelfBook, ShelfUpdatePayload, Visibility } from "@/types/shelf";
import type { ShelfUpsertForm } from "@/domain/shelf";

defineProps<{ entries: ShelfBook[] }>();

const store = useShelvesStore();
const mutating = store.$state.mutating;
const isLoading = computed(() => store.loading.items);
const skeletonCount = 24;

const editRef = ref<InstanceType<typeof BookAddConfigModal> | null>(null);

function onOpenEdit(entry: ShelfBook) {
  editRef.value?.openFromShelf(entry);  // 수정 모드로 오픈
}

async function onConfirmEdit(p: ShelfUpdatePayload & { totalPages?: number }) {
  // ShelfUpdatePayload -> ShelfUpsertForm으로 변환
  const form: ShelfUpsertForm = {
    mode: 'edit',
    shelfBookId: p.shelfBookId,
    // 업데이트에서는 책 메타가 필요 없으니 빈 BookLike로 충분
    book: {},

    // 진행 상태/진행도
    readingStatus: p.readingStatus,                 // ← 핵심: status만 사용(중복 필드 없음)
    currentPage: p.currentPage,
    startDate: p.startDate ?? undefined,
    endDate: p.endDate ?? undefined,

    // 메모/리뷰
    memo: p.memo ?? null,
    review: p.review ?? null,
    reviewPublic: (p.reviewVisibility as Visibility | undefined) === 'PUBLIC' ? true
                 : (p.reviewVisibility ? false : undefined),

    // 평점
    rating: p.rating ?? null,

    // UI 참고값(선택)
    totalPages: (p as any).totalPages,
  };

  try {
    await store.updateShelfItem(form);
    try { editRef.value?.close?.(); } catch {}
  } catch (e) {
    // 필요하면 에러 토스트
  }
}
</script>

<style scoped>
</style>