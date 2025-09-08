<template>
  <div class="login-callback">
    <p>로그인 처리 중...</p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from 'vue';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

onMounted(async () => {
  const token = route.query.token as string | undefined;
  const error = route.query.error as string | undefined;

  if (error) {
    alert('SNS 로그인 실패: ' + error);
    router.replace({ name: 'login' });
    return;
  }

  if (token) {
    try {
      await auth.loginByToken(token); // 토큰 저장 + /users/me 호출
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