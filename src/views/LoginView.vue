<template>
  <section class="page-auth">
    <div class="auth-card">
      <h1 class="brand">
        <span class="brand__chek">책</span><span class="brand__dam">담</span><span class="brand__chek">책</span><span class="brand__dam">담</span>
      </h1>

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

        <label class="keep-login">
          <input type="checkbox" v-model="rememberMe" />
          로그인 상태 유지
        </label>

        <!-- 로그인 버튼 -->
        <button :disabled="loading" type="submit">
          {{ loading ? '로그인 중…' : '로그인' }}
        </button>

        <!-- Google 로그인 (로그인 버튼 '아래') -->
        <button type="button" class="btn-google" @click="snsLogin('google')" aria-label="Google 로그인">
          <!-- Google 로고 (SVG) -->
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3A12.9 12.9 0 1 1 24 11a12.7 12.7 0 0 1 8.2 3.1l5.7-5.7A20.9 20.9 0 1 0 44.9 24c0-1.2-.1-2.3-.3-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.9A12.3 12.3 0 0 1 24 11c3.1 0 6 .9 8.4 3.1l5.7-5.7A20.8 20.8 0 0 0 24 3 20.9 20.9 0 0 0 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 45a20.9 20.9 0 0 0 20.9-21c0-1.2-.1-2.3-.3-3.5H24v8h11.3A12.5 12.5 0 0 1 24 36.9c-5 0-9.3-3-11.1-7.4l-6.6 5A20.9 20.9 0 0 0 24 45z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 4.4-5.1 7.7-9.9 7.7-5 0-9.3-3-11.1-7.4l-6.6 5A20.9 20.9 0 0 0 24 45c10.1 0 20-7.3 20-21 0-1.2-.1-2.3-.4-3.5z"/>
          </svg>
          <span>Google 로그인</span>
        </button>

        <p v-if="error" class="auth-error">{{ error }}</p>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter, useRoute } from 'vue-router';
import { OAUTH2_AUTH_URL } from '@/utils/constants';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

const rememberMe = ref(true);

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

function snsLogin(provider: keyof typeof OAUTH2_AUTH_URL) {
  const redirectUri = window.location.origin + '/login/callback';
  const base = OAUTH2_AUTH_URL[provider];
  const url = `${base}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  window.location.href = url;
}
</script>

<style scoped>
</style>