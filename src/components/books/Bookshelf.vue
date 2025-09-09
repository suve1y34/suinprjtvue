<template>
  <div class="shelf" role="list">
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
import { useShelvesStore } from "@/stores/shelves.store";
import BookSpine from "./BookSpine.vue";
import BookAddConfigModal from "./BookAddConfigModal.vue";
import type { ShelfBook, ShelfUpdatePayload } from "@/types/shelf";

defineProps<{ entries: ShelfBook[] }>();

const store = useShelvesStore();
const mutating = store.$state.mutating;
const isLoading = computed(() => store.loading.items);
const skeletonCount = 24; // 반응형 그리드에서 2~3줄 채울 정도의 기본 수

const editRef = ref<InstanceType<typeof BookAddConfigModal> | null>(null);

function onOpenEdit(entry: ShelfBook) {
  editRef.value?.openFromShelf(entry);  // 수정 모드로 오픈
}

async function onConfirmEdit(p: ShelfUpdatePayload & { totalPages?: number }) {
  try {
    await store.updateShelfItem(p); // 단일 업데이트 API
  } catch (e: any) {
  }
}
</script>

<style scoped>
</style>