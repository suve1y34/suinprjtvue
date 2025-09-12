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
  const m = stats.value?.monthly ?? [];
  const max = Math.max(1, ...m.map(x => x.value));
  return m.map(x => ({
    name: x.label, value: x.value, h: Math.round((x.value / max) * 100)
  }));
});

defineExpose({ open, close });
</script>