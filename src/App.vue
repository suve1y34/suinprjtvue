<template>
  <main class="min-h-screen">
    <router-view/>
    <Toast />
  </main>
</template>
<script setup lang="ts">
import Toast from '@/components/ui/Toast.vue';
</script>