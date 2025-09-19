<template>
  <div class="login-callback" role="status" aria-live="polite" aria-busy="true">
    <div class="panel">
      <div class="spinner" aria-hidden="true"></div>
      <p class="msg">로그인 처리 중...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores';
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from 'vue';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

onMounted(async () => {
  const token = route.query.token as string | undefined;
  const error = route.query.error as string | undefined;

  if (error) {
    alert('구글 로그인 실패: ' + error);
    router.replace({ name: 'login' });
    return;
  }

  if (token) {
    try {
      await auth.loginByToken(token); // 토큰 저장 + 내정보 호출
      router.replace({ name: 'books-list' });
    } catch {
      alert('로그인 처리 중 오류가 발생했습니다.');
      router.replace({ name: 'login' });
    }
  } else {
    router.replace({ name: 'login' });
  }
});
</script>