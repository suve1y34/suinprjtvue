<template>
  <section class="auth-card">
    <h1 class="brand">
      <span class="brand__chek">책</span><span class="brand__dam">담</span><span class="brand__chek">책</span><span class="brand__dam">담</span>
    </h1>
    <h2>로그인</h2>
    <form @submit.prevent="onSubmit" class="auth-form">
      <input
        v-model="email"
        type="email"
        placeholder="이메일"
        required
        autocomplete="username"
      />
      <input
        v-model="password"
        type="password"
        placeholder="비밀번호"
        required
        autocomplete="current-password"
      />
      <button :disabled="loading" type="submit">
        {{ loading ? '로그인 중…' : '로그인' }}
      </button>
      <p v-if="error" class="auth-error">{{ error }}</p>
      
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter, useRoute } from 'vue-router';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

async function onSubmit() {
  if (loading.value) return;
  loading.value = true; error.value = null;
  try {
    await auth.login(email.value.trim(), password.value);
    // 리다이렉트 대상이 있으면 거기로, 없으면 책장
    const redirect = (route.query.redirect as string) || '/';
    router.replace(redirect);
  } catch (e: any) {
    error.value = e?.message ?? '로그인 실패';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
</style>