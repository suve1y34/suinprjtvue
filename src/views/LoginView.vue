<template>
  <section class="page-auth">
    <div class="auth-card">
      <p class="login-sub">나의 독서 과정을 기록하는 가장 쉬운 방법</p>
      <h1 class="brand">
        <span class="brand__chek">책</span><span class="brand__dam">담</span><span class="brand__chek">책</span><span class="brand__dam">담</span>
      </h1>

      <div class="sns-only">
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
      </div>
      <p class="login-privacy">Google 로그인은 이메일/이름만 사용하며, 비밀번호는 저장하지 않습니다.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { OAUTH2_AUTH_URL } from '@/utils/constants';

function snsLogin(provider: keyof typeof OAUTH2_AUTH_URL) {
  const redirectUri = window.location.origin + '/login/callback';
  const base = OAUTH2_AUTH_URL[provider];
  const url = `${base}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  window.location.href = url;
}
</script>

<style scoped>
</style>