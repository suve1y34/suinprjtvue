<template>
  <dialog ref="dlg" class="modal modal--md">
    <form class="modal__box" @submit.prevent>
      <header class="modal__head">
        <strong>독서 달력</strong>
        <div class="flex-gap">
          <button type="button" class="btn btn--outline-black" aria-label="close" @click="close">✕</button>
        </div>
      </header>

      <div class="modal__content">
        <div class="cal-wrap" :class="{ 'is-loading': loading }">
          <Calendar
            v-model="cursor"
            is-expanded
            :attributes="[]"
            @update:month="onMonthChanged"
          >
            <!-- 날짜 셀 커스텀 -->
            <template #day-content="{ day }">
              <button
                type="button"
                class="day-cell"
                :class="{ 'has-finished': !!firstFinished(ymd(day.date)) }"
                @click="onPickDay(day.date)"
                :title="titleOf(ymd(day.date))"
              >
                <span class="day-num">{{ day.day }}</span>

                <div v-if="firstFinished(ymd(day.date))" class="cover-wrap">
                  <img
                    class="cover-img"
                    :src="firstFinished(ymd(day.date))?.coverImageUrl || ''"
                    alt=""
                    loading="lazy"
                    @error="onImgError"
                  />
                </div>
              </button>
            </template>
          </Calendar>
          <div v-if="loading" class="cal-loading">불러오는 중…</div>
        </div>

        <!-- 선택한 날짜의 목록 -->
        <div v-if="pickedList.length" class="picked-list">
          <h4 class="picked-title">
            {{ pickedDateLabel }} 완독 {{ pickedList.length }}권
          </h4>
          <ul class="picked-grid">
            <li v-for="b in pickedList" :key="b.shelfBookId" class="picked-item">
              <div class="picked-thumb">
                <img
                  :src="b.coverImageUrl || ''"
                  alt=""
                  loading="lazy"
                  @error="onImgError"
                />
              </div>
              <div class="picked-meta">
                <div class="picked-title-t">{{ b.title }}</div>
              </div>
            </li>
          </ul>
        </div>

        <div v-else class="picked-empty">날짜를 탭하면 그날의 완독 책이 보여요.</div>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useShelvesStore } from '@/stores';
import type { FinishedBook, FinishedMonthResp } from '@/types/shelf';
import { Calendar } from 'v-calendar';
import 'v-calendar/style.css';

const dlg = ref<HTMLDialogElement | null>(null);
const isOpen = ref(false);

// 현재 달(커서)
const cursor = ref(new Date());

// 날짜별 완독 맵: 'YYYY-MM-DD' -> FinishedBook[]
const finishedDays = ref<Record<string, FinishedBook[]>>({});

// 선택한 날짜
const pickedDate = ref<string | null>(null);

const store = useShelvesStore();
const loading = ref(false);

// 유틸: 로컬 타임존 기준 포맷
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
function ym(d: Date) {
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

const ymLabel = computed(() => {
  const { year, month } = ym(cursor.value);
  return `${year}.${String(month).padStart(2, '0')}`;
});

function firstFinished(key: string) {
  const arr = finishedDays.value[key];
  return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
}
function titleOf(key: string) {
  const arr = finishedDays.value[key];
  if (!arr || arr.length === 0) return '';
  const head = arr[0].title || '완독';
  const extra = arr.length > 1 ? ` 외 ${arr.length - 1}권` : '';
  return `${head}${extra}`;
}

async function loadMonthByDate(d: Date) {
  loading.value = true;
  try {
    const { year, month } = ym(d);
    const resp = await store.fetchReadLogByMonth(year, month, true) as FinishedMonthResp;
    finishedDays.value = resp?.days ?? {};
    // 달이 바뀌면 선택 해제
    pickedDate.value = null;
  } finally {
    loading.value = false;
  }
}

function onMonthChanged({ month, year }: { month: number; year: number }) {
  // v-calendar는 1-12 기준 month 이벤트를 줌
  const d = new Date(year, month - 1, 1);
  cursor.value = d; // v-model 동기
  loadMonthByDate(d);
}

function goPrevMonth() {
  const d = new Date(cursor.value);
  d.setMonth(d.getMonth() - 1, 1);
  cursor.value = d;
  loadMonthByDate(d);
}
function goNextMonth() {
  const d = new Date(cursor.value);
  d.setMonth(d.getMonth() + 1, 1);
  cursor.value = d;
  loadMonthByDate(d);
}
function goToday() {
  const d = new Date();
  d.setDate(1);
  cursor.value = d;
  loadMonthByDate(d);
}

function onPickDay(date: Date) {
  const key = ymd(date);
  const arr = finishedDays.value[key] || [];
  pickedDate.value = arr.length ? key : null;
}

const pickedList = computed<FinishedBook[]>(() => {
  if (!pickedDate.value) return [];
  return finishedDays.value[pickedDate.value] || [];
});
const pickedDateLabel = computed(() => pickedDate.value ?? '');

function onImgError(e: Event) {
  const el = e.target as HTMLImageElement;
  if (el) el.style.display = 'none';
}

async function ensureOpen() {
  if (!dlg.value) return;
  if (!isOpen.value) {
    dlg.value.showModal();
    isOpen.value = true;
    await nextTick();
  }
  await loadMonthByDate(cursor.value);
}

function close() {
  if (!dlg.value || !isOpen.value) return;
  dlg.value.close();
}
function handleClose() {
  isOpen.value = false;
  // 선택 초기화
  pickedDate.value = null;
}
function onCancel(e: Event) {
  e.preventDefault();
  close();
}

onMounted(() => {
  dlg.value?.addEventListener('close', handleClose);
  dlg.value?.addEventListener('cancel', onCancel);
});
onBeforeUnmount(() => {
  dlg.value?.removeEventListener('close', handleClose);
  dlg.value?.removeEventListener('cancel', onCancel);
});

// 외부에서 open/close 사용할 수 있게
defineExpose({ open: ensureOpen, close });
</script>

<style scoped>
</style>