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

<template>
  <section class="login">
    <h1>책담책담</h1>
    <h2>로그인</h2>
    <form @submit.prevent="onSubmit" class="form">
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
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </section>
</template>

<style scoped>
.login { max-width: 360px; margin: 80px auto; padding: 24px; border: 1px solid #eee; border-radius: 8px; }
.form { display: grid; gap: 10px; }
input { border: 1px solid #ddd; border-radius: 6px; padding: 10px; }
button { padding: 10px 12px; border: 1px solid #222; background: #222; color: #fff; border-radius: 6px; cursor: pointer; }
button:disabled { opacity: .6; cursor: default; }
.error { color: #c22727; font-size: 14px; }
</style>