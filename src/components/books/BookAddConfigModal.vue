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
          <select v-model="status" class="select" @change="onStatusChange">
            <option value="PLAN">읽기전</option>
            <option value="READING">읽는중</option>
            <option value="DONE">다읽음</option>
          </select>
        </div>

        <div class="form-col" v-if="status === 'READING'">
          <label class="form-label">독서량 (페이지)</label>
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

        <!-- 시작/종료 날짜 -->
        <div class="form-col" v-if="status !== 'PLAN'">
          <label class="form-label">시작일</label>
          <input class="input" type="date" v-model="startDate" />
        </div>
        <div class="form-col" v-if="status === 'DONE'">
          <label class="form-label">종료일</label>
          <input class="input" type="date" v-model="endDate" />
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

        <!-- 리뷰 + 공개여부 -->
        <div class="form-col">
          <label class="form-label">리뷰</label>
          <textarea
            class="textarea textarea--sm"
            rows="4"
            v-model="review"
            placeholder="다른 사람과 공유할 수 있는 리뷰를 입력하세요"
          ></textarea>
        </div>

        <div class="form-col">
          <label class="form-label">리뷰 공개</label>
          <label class="switch">
            <input type="checkbox" v-model="reviewPublic" />
            <span class="slider"></span>
            <span class="switch__label">{{ reviewPublic ? '공개' : '비공개' }}</span>
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
import { useShelvesStore } from "@/stores";
import type { AladinBook } from "@/types/aladin";
import type { BookLike, ReadingStatus, ShelfUpdatePayload, Visibility, AddPayload } from "@/types/shelf";


const store = useShelvesStore();


const dlg = ref<HTMLDialogElement | null>(null);
const isOpen = ref(false);
const mode = ref<"add" | "edit">("add");
const shelfBookId = ref<number | null>(null);
const book = ref<BookLike | null>(null);

const status = ref<ReadingStatus>("PLAN");
const currentPage = ref<number>(0);

const startDate = ref<string|null>(null);
const endDate = ref<string|null>(null);

const memo = ref<string>("");
const review = ref<string>("");
const reviewPublic = ref<boolean>(false);

const initial = ref<{
  status: ReadingStatus;
  currentPage: number;
  memo: string;
  review: string;
  reviewPublic: boolean;
  startDate: string|null;
  endDate: string|null
} | null>(null);

const todayStr = () => new Date().toISOString().slice(0, 10);

function coverPick(b: any) {
  const u = b.coverImageUrl || b.coverLargeUrl || b.cover || b.coverSmallUrl;
  return u ? { coverImageUrl: u } : {};
}

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

function onStatusChange() {
  if (status.value === "READING") {
    if (!startDate.value) startDate.value = todayStr();
    endDate.value = null;
  } else if (status.value === "DONE") {
    if (!startDate.value) startDate.value = todayStr();
    if (!endDate.value) endDate.value = todayStr();
  } else if (status.value === "PLAN") {
    startDate.value = null;
    endDate.value = null;
  }
}

// 커버 미리보기 URL
const coverUrl = computed<string | undefined>(() => {
  const b: any = book.value || {};
  return b.coverImageUrl || b.coverLargeUrl || b.cover || b.coverSmallUrl || undefined;
});

const emit = defineEmits<{
  (e: 'confirm-add',  payload: AddPayload): void;
  (e: 'confirm-edit', payload: ShelfUpdatePayload & { totalPages?: number }): void;
}>();

async function ensureOpen() {
  if (!dlg.value) return;
  if (!isOpen.value) {
    dlg.value.showModal();
    isOpen.value = true;
    await nextTick();
  }
}


function close() {
  if (!dlg.value || !isOpen.value) return;
  dlg.value.close();
}

function handleDialogClose() {
  isOpen.value = false;
  resetState();
}

function onCancel(_e: Event) {
  // no-op
}

function resetState() {
  mode.value = "add";
  shelfBookId.value = null;
  book.value = null;
  status.value = "PLAN";
  currentPage.value = 0;
  memo.value = "";
  review.value = "";
  reviewPublic.value = false;
  startDate.value = null;
  endDate.value = null;
  initial.value = null;
}

function primeInitial() {
  initial.value = {
    status: status.value,
    currentPage: currentPage.value,
    memo: memo.value ?? "",
    review: review.value ?? "",
    reviewPublic: reviewPublic.value,
    startDate: startDate.value,
    endDate: endDate.value,
  };
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
  review.value = "";
  reviewPublic.value = false;

  primeInitial();
  ensureOpen();
}

async function openFromShelf(entry: {
  shelfBookId: number;
  readingStatus?: ReadingStatus;
  currentPage?: number;
  memo?: string | null;
  review?: string | null;
  reviewVisibility?: Visibility;
  startDate?: string | null;
  endDate?: string | null;
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
    coverImageUrl: fresh.book?.coverImageUrl ?? entry.book?.coverImageUrl,
  };
  status.value = (fresh as any).readingStatus ?? entry.readingStatus ?? "PLAN";
  currentPage.value = (fresh as any).currentPage ?? entry.currentPage ?? 0;
  memo.value = (fresh as any).memo ?? entry.memo ?? "";
  review.value = (fresh as any).review ?? entry.review ?? "";
  reviewPublic.value = ((fresh as any).reviewVisibility ?? entry.reviewVisibility) === "PUBLIC";

  startDate.value = entry.startDate||null;
  endDate.value = entry.endDate||null;

  primeInitial();
  ensureOpen();
}

defineExpose({ openFromSearch, openFromShelf, close });

function onConfirm() {
  if (!book.value) return;
  const total = pages.value;
  let cp = Number.isFinite(currentPage.value) ? currentPage.value : 0;
  if (typeof total === "number") cp = Math.max(0, Math.min(cp, total));

  const memoTrimmed = (memo.value ?? "").trim();
  const reviewTrimmed = (review.value ?? "").trim();
  const reviewVis: Visibility = reviewPublic.value ? "PUBLIC" : "PRIVATE";

  if (mode.value === "add") {
    const ok = window.confirm(`‘${statusLabel.value}’ 상태로 책장에 추가하시겠습니까?`);
    if (!ok) return;

    const payload: AddPayload = {
      book: book.value as BookLike,
      status: status.value,
      startDate:startDate.value||undefined,
      endDate:endDate.value||undefined,
      currentPage: cp,
      memo: memoTrimmed || undefined,
      memoVisibility: 'PRIVATE',

      // 리뷰
      review: reviewTrimmed || undefined,
      reviewVisibility: reviewVis,
    };
    if (memoTrimmed.length > 0) payload.memo = memoTrimmed;
    emit("confirm-add", payload);

    close();
    return;
  } else if (shelfBookId.value != null) {
    const init = initial.value;
    const memoChanged   = init ? memoTrimmed   !== (init.memo ?? "")         : (memoTrimmed.length > 0);
    const reviewChanged = init ? reviewTrimmed !== (init.review ?? "") || reviewPublic.value !== init.reviewPublic
                               : (reviewTrimmed.length > 0);

    const payload: ShelfUpdatePayload & { totalPages?: number } = {
      shelfBookId: shelfBookId.value!,
      currentPage: cp,
      startDate:startDate.value||undefined,
      endDate:endDate.value||undefined,
      readingStatus: status.value,
      totalPages: total,
      memoChanged,
      memo: memoChanged ? (memoTrimmed.length ? memoTrimmed : null) : undefined,
      memoVisibility: 'PRIVATE',
      // 리뷰
      review: reviewChanged ? (reviewTrimmed.length ? reviewTrimmed : null) : undefined,
      reviewVisibility: reviewChanged ? reviewVis : undefined,
      reviewChanged,
    };

    emit("confirm-edit", payload);
    close();
  }
}

const statusLabel = computed(() => {
  switch (status.value) {
    case "READING": return "읽는중";
    case "DONE":    return "다읽음";
    default:        return "읽기전";
  }
});

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement;
  if (img) img.style.display = "none";
}

function onClickClose() {
  close();
}

onMounted(() => {
  dlg.value?.addEventListener("close", handleDialogClose);
  dlg.value?.addEventListener("cancel", onCancel);
});
onBeforeUnmount(() => {
  dlg.value?.removeEventListener("close", handleDialogClose);
  dlg.value?.removeEventListener("cancel", onCancel);
});

</script>

<style scoped>
</style>