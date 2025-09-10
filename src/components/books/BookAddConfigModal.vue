<template>
  <dialog ref="dlg" class="modal modal--sm">
    <form class="modal__box" @submit.prevent="onConfirm">
      <header class="modal__head">
        <strong>{{ mode === 'add' ? '책 추가' : '책 수정' }}</strong>
        <button
          @click="onClickClose"
          type="button"
          aria-label="close"
          class="btn btn--outline-black"
        >✕</button>
      </header>

      <div v-if="book">
        <div class="book-head" v-if="book">
          <div class="cover">
            <img v-if="coverUrl" :src="coverUrl" :alt="book.title || 'cover'" @error="onImgError">
          </div>
          <div class="meta">
            <h3 class="book-title">{{ book.title }}</h3>
            <div class="book-author" v-if="book.author">{{ book.author }}</div>
            <div class="book-pages" v-if="pages">{{ pages }}p</div>
          </div>
          
        </div>

        <div class="progress-box">
          <div class="progress-label">{{ percentText }}</div>
          <div
            class="progress-bar"
            role="progressbar"
            :aria-valuenow="percentValue"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="progress-fill" :style="{ width: percentValue + '%' }"></div>
          </div>
        </div>

        <div class="form-col">
          <label class="form-label">독서 상태</label>
          <select v-model="status" class="select">
            <option value="PLAN">읽기전</option>
            <option value="READING">읽는중</option>
            <option value="DONE">다읽음</option>
          </select>
        </div>

        <div class="form-col" v-if="status === 'READING'">
          <label class="form-label">독서량</label>
          <input
            class="input"
            type="number"
            v-model.number="currentPage"
            min="0"
            :max="pages ?? undefined"
            inputmode="numeric"
            placeholder="현재 페이지"
          />
        </div>

        <div class="form-col">
          <label class="form-label">책 메모</label>
          <textarea
            class="textarea textarea--sm"
            rows="4"
            v-model="memo"
            placeholder="메모를 입력하세요"
          ></textarea>
        </div>

        <div class="form-col">
          <label class="form-label">메모 공개</label>
          <label class="switch">
            <input type="checkbox" v-model="memoPublic" />
            <span class="slider"></span>
            <span class="switch__label">{{ memoPublic ? '공개' : '비공개' }}</span>
          </label>
        </div>

        <div class="modal__actions">
          <button type="button" class="btn btn--outline-black" @click="onClickClose">취소</button>
          <button type="submit" class="btn btn--solid-gray">저장</button>
        </div>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useShelvesStore } from "@/stores/shelves.store";
import type { AladinBook } from "@/types/aladin";
import type { BookLike, ReadingStatus, ShelfUpdatePayload, MemoVisibility, AddPayload } from "@/types/shelf";


const store = useShelvesStore();

const dlg = ref<HTMLDialogElement | null>(null);
const isOpen = ref(false);
const mode = ref<"add" | "edit">("add");
const shelfBookId = ref<number | null>(null);
const book = ref<BookLike | null>(null);
const status = ref<ReadingStatus>("PLAN");
const currentPage = ref<number>(0);

const memo = ref<string>("");
const memoPublic = ref<boolean>(false);

const pages = computed<number | undefined>(() => book.value?.pages ?? undefined);

const percentValue = computed<number>(() => {
  const tp = typeof pages.value === 'number' ? pages.value : 0;
  if (!tp || tp <= 0) return 0;
  if (status.value === 'DONE') return 100;
  const cp0 = Number.isFinite(currentPage.value) ? currentPage.value : 0;
  const cp = Math.max(0, Math.min(cp0, tp));
  return Math.floor((cp / tp) * 100);
});
const percentText = computed<string>(() => {
  const tp = typeof pages.value === 'number' ? pages.value : 0;
  if (!tp || tp <= 0) return '—%';
  return `${percentValue.value}%`;
});

const initial = ref<{ status: ReadingStatus; currentPage: number; memo: string } | null>(null);

// 커버 미리보기 URL
const coverUrl = computed<string | undefined>(() => {
  const b: any = book.value || {};
  return b.coverImageUrl || b.coverLargeUrl || b.cover || b.coverSmallUrl || undefined;
});

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement;
  if (img) img.style.display = "none";
}

const emit = defineEmits<{
  (e: "confirm-add", payload: { book: BookLike; status: ReadingStatus; currentPage: number; memo?: string | null }): void;
  (e: "confirm-edit", payload: ShelfUpdatePayload & { totalPages?: number }): void;
}>();

function resetState() {
  mode.value = "add";
  shelfBookId.value = null;
  book.value = null;
  status.value = "PLAN";
  currentPage.value = 0;
  memo.value = "";
  initial.value = null;
}

/* */
async function ensureOpen() {
  if (!dlg.value) return;
  if (!isOpen.value) {
    dlg.value.showModal();
    isOpen.value = true;
    await nextTick();
  }
}

function openFromSearch(b: AladinBook) {
  // 상태 세팅
  mode.value = "add";
  shelfBookId.value = null;
  book.value = {
    title: b.title,
    author: b.author,
    pages: (b as any).pages ?? (b as any).itemPage ?? undefined,
    isbn13Code: (b as any).isbn13Code,
    ...(coverPick(b))
  };

  status.value = "PLAN";
  currentPage.value = 0;
  memo.value = "";
  memoPublic.value = false;

  initial.value = {
    status: status.value,
    currentPage: currentPage.value,
    memo: memo.value
  };

  ensureOpen();
}

function coverPick(b: any) {
  const u = b.coverImageUrl || b.coverLargeUrl || b.cover || b.coverSmallUrl;
  return u ? { coverImageUrl: u } : {};
}

async function openFromShelf(entry: {
  shelfBookId: number;
  readingStatus?: ReadingStatus;
  currentPage?: number;
  memo?: string | null;
  memoVisibility?: MemoVisibility;
  book?: { title?: string; author?: string; pages?: number; isbn13Code?: string };
}) {
  mode.value = "edit";
  shelfBookId.value = entry.shelfBookId;

  await store.fetchShelfItems();
  const fresh = store.shelfItems.find(e => e.shelfBookId === entry.shelfBookId) ?? entry;

  book.value = {
    title: fresh.book?.title ?? entry.book?.title,
    author: fresh.book?.author ?? entry.book?.author,
    pages: fresh.book?.pages ?? entry.book?.pages,
    isbn13Code: fresh.book?.isbn13Code ?? entry.book?.isbn13Code,
  };
  status.value = (fresh as any).readingStatus ?? entry.readingStatus ?? "PLAN";
  currentPage.value = (fresh as any).currentPage ?? entry.currentPage ?? 0;
  memo.value = (fresh as any).memo ?? entry.memo ?? "";
  memoPublic.value = ((fresh as any).memoVisibility ?? entry.memoVisibility) === "PUBLIC";

  initial.value = {
    status: status.value,
    currentPage: currentPage.value,
    memo: memo.value ?? ""
  };

  ensureOpen();
}

function close() {
  if (!dlg.value || !isOpen.value) return;
  dlg.value.close();
}

function onClickClose() {
  close();
}

function onConfirm() {
  if (!book.value) return;
  const total = pages.value;
  let cp = Number.isFinite(currentPage.value) ? currentPage.value : 0;
  if (typeof total === "number") cp = Math.max(0, Math.min(cp, total));

  const memoTrimmed = (memo.value ?? "").trim();
  const visibility: MemoVisibility = memoPublic.value ? "PUBLIC" : "PRIVATE"; // ★

  const init = initial.value; // ★
  const initMemoTrimmed = (init?.memo ?? "").trim();

  if (mode.value === "add") {
    const payload: AddPayload = {
      book: book.value as BookLike,
      status: status.value,
      currentPage: cp,
      memo: memoTrimmed || undefined,
      memoVisibility: visibility,
    };
    if (memoTrimmed.length > 0) payload.memo = memoTrimmed;
    emit("confirm-add", payload);
  } else if (shelfBookId.value != null) {
    const init = initial.value;
    const statusChanged = init ? status.value !== init.status : true;
    const pageChanged   = init ? cp !== init.currentPage : true;
    const memoChanged   = init ? memoTrimmed !== (init.memo ?? "").trim() : (memoTrimmed.length > 0);

    const payload: ShelfUpdatePayload & { totalPages?: number } = {
      shelfBookId: shelfBookId.value!,
      currentPage: cp,
      readingStatus: status.value,
      totalPages: total,
      memoVisibility: visibility,
    };

    if (memoChanged) {
      payload.memoChanged = true;
      payload.memo = memoTrimmed.length ? memoTrimmed : null;
    } else {
      payload.memoChanged = false;
    }

    emit("confirm-edit", payload);
  }
  close();
}

function handleDialogClose() {
  isOpen.value = false;
  resetState();
}

function onCancel(_e: Event) {
  // no-op
}

onMounted(() => {
  dlg.value?.addEventListener("close", handleDialogClose);
  dlg.value?.addEventListener("cancel", onCancel);
});
onBeforeUnmount(() => {
  dlg.value?.removeEventListener("close", handleDialogClose);
  dlg.value?.removeEventListener("cancel", onCancel);
});

defineExpose({ openFromSearch, openFromShelf, close });
</script>

<style scoped>
</style>