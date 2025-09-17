<template>
  <dialog ref="dlg" class="modal modal--lg">
    <form class="modal__box" @submit.prevent>
      <header class="modal__head">
        <strong>독서 통계</strong>
        <div class="flex-gap">
          <select class="select year-select" v-model.number="year" @change="load">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
          <button type="button" class="btn btn--outline-black" @click="close">✕</button>
        </div>
      </header>

      <div v-if="loading" class="state state--center">불러오는 중…</div>
      <div v-else-if="error" class="state state--error">{{ error }}</div>

      <div v-else-if="stats" class="stats-grid">
        <!-- 도넛(상태 비율) -->
        <section class="card">
          <h4>상태별 비율</h4>
          <div class="donut-wrap">
            <div class="donut" :style="donutStyle" aria-label="상태 비율 도넛"></div>
            <ul class="legend">
              <li v-for="s in stats.statusRatio" :key="s.key">
                <span class="dot" :class="'k-'+s.key"></span>{{ s.label }}: <strong>{{ s.value }}</strong>
              </li>
            </ul>
          </div>
        </section>

        <!-- 막대(월별 완료 권수) -->
        <section class="card">
          <h4>월별 완독 권수</h4>
          <div class="bars">
            <div class="bar" v-for="m in barData" :key="m.name">
              <div class="bar__col" :style="{ height: m.h + '%' }" :title="m.value + '권'"></div>
              <div class="bar__label">{{ m.name }}</div>
            </div>
          </div>
        </section>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useShelvesStore } from "@/stores";

const dlg = ref<HTMLDialogElement|null>(null);
const shelves = useShelvesStore();
const now = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => now - i);
const year = ref<number>(shelves.statsYear || now);

function open() {
  dlg.value?.showModal();
  load();
}
function close() { dlg.value?.close(); }

async function load() {
  await shelves.fetchStats(year.value);
}

const loading = computed(() => shelves.loading.stats);
const error = computed(() => shelves.error.stats);
const stats = computed(() => shelves.stats);

const totalStatus = computed(() => (stats.value?.statusRatio ?? []).reduce((a, b) => a + b.value, 0));
const pct = (v: number) => (totalStatus.value ? Math.round((v / totalStatus.value) * 100) : 0);

const donutStyle = computed(() => {
  const s = stats.value?.statusRatio ?? [];
  const pPlan = pct(s.find(x => x.key === 'PLAN')?.value || 0);
  const pReading = pct(s.find(x => x.key === 'READING')?.value || 0);
  const pDone = 100 - pPlan - pReading;
  return {
    background: `conic-gradient(var(--c-plan) 0 ${pPlan}%,
                               var(--c-reading) ${pPlan}% ${pPlan + pReading}%,
                               var(--c-done) ${pPlan + pReading}% 100%)`
  };
});

const barData = computed(() => {
  const base = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: String(i + 1),
    value: 0
  }));

  const raw = stats.value?.monthly ?? [];
  for (const x of raw) {
    // month 번호 추출 (문자/숫자/label 모두 수용)
    const mRaw = (x as any).month ?? (x as any).m ?? (x as any).key ?? (x as any).label;
    const mNum = typeof mRaw === 'string' ? parseInt(mRaw, 10) : Number(mRaw);
    const idx = mNum - 1;
    if (idx >= 0 && idx < 12) {
      const val = (x as any).value ?? (x as any).count ?? (x as any).total ?? 0;
      base[idx].value = Number(val) || 0;
    }
  }

  // ③ 퍼센트/최소 높이 계산
  const max = Math.max(1, ...base.map(b => b.value));
  return base.map(b => {
    const hPct = Math.round((b.value / max) * 100);
    // 값이 있으면 너무 얇지 않게 최소 6% 보장(160px 기준 약 10px)
    const h = b.value > 0 ? Math.max(6, hPct) : 0;
    return { name: b.label, value: b.value, h };
  });
});

defineExpose({ open, close });
</script>