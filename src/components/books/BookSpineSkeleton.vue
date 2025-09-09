<template>
  <div class="spine spine--skeleton" :style="{ width: widthPx }" aria-hidden="true">
    <span class="badge badge--skeleton"></span>
    <span class="spine__title shimmer-line"></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const avgWidth = 22;
const widthPx = computed(() => `${avgWidth}px`);
</script>