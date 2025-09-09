<template>
  <teleport to="body">
    <div class="toast-host" aria-live="polite" aria-atomic="true">
      <transition-group name="toast" tag="div" class="toast-stack">
        <div
          v-for="t in items"
          :key="t.id"
          class="toast"
          :class="`toast--${t.type}`"
          role="status"
        >
          <div class="toast__icon" aria-hidden="true">
            <span v-if="t.type==='success'">✔</span>
            <span v-else-if="t.type==='error'">✖</span>
            <span v-else>ℹ</span>
          </div>
          <div class="toast__msg">{{ t.message }}</div>
          <button class="toast__close" @click="remove(t.id)" aria-label="닫기">×</button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useToastStore } from '@/stores/toast.store';

const toast = useToastStore();
const { items } = storeToRefs(toast);
const { remove } = toast;

onMounted(() => {
  // http 인터셉터에서 쏘는 window 이벤트와 연결
  toast.bindGlobalListeners();
});
</script>