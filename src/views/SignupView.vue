<template>
  <div class="page page-auth">
    <div class="auth-card">
      <h1 class="auth-title">회원가입</h1>

    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import type { RegisterReq } from '@/types/user';

type Form = RegisterReq & { confirm: string };

const router = useRouter();
const auth = useAuthStore();

const form = reactive<Form>({
  email: '',
  password: '',
  confirm: '',
  userName: '',
  nickname: '',
});

const touched = reactive<Record<keyof Form | 'confirm', boolean>>({
  email: false,
  password: false,
  confirm: false,
  userName: false,
  nickname: false,
});

const autoLogin = ref(true); // 기본값: 자동 로그인
const submitting = ref(false);
const serverError = ref('');
const serverSuccess = ref('');

const MIN_PW = 8;
function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function validate(f: Form) {
  const e: Partial<Record<keyof Form | 'confirm', string>> = {};
  if (!f.email) e.email = '이메일을 입력하세요.';
  else if (!isEmail(f.email)) e.email = '이메일 형식이 올바르지 않습니다.';

  if (!f.password) e.password = '비밀번호를 입력하세요.';
  else if (f.password.length < MIN_PW) e.password = `비밀번호는 ${MIN_PW}자 이상이어야 합니다.`;

  if (!f.confirm) e.confirm = '비밀번호 확인을 입력하세요.';
  else if (f.password !== f.confirm) e.confirm = '비밀번호가 일치하지 않습니다.';

  if (!f.userName) e.userName = '이름을 입력하세요.';
  return e;
}
const errors = computed(() => validate(form));
function touch(field: keyof typeof touched) {
  touched[field] = true;
}
function showError(field: keyof typeof touched) {
  return touched[field] && (errors.value as any)[field];
}

async function onSubmit() {
  serverError.value = '';
  serverSuccess.value = '';
  // 모든 필드 터치
  Object.keys(touched).forEach(k => (touched[k as keyof typeof touched] = true));

  const currentErrors = errors.value;
  if (Object.keys(currentErrors).length > 0) return;

  submitting.value = true;
  try {
    await authApi.register({
      email: form.email,
      password: form.password,
      userName: form.userName,
      nickname: form.nickname?.trim() || undefined,
    });

    if (autoLogin.value) {
      await auth.login(form.email, form.password, { remember: true });
      router.replace({ name: 'books-list' });
    } else {
      serverSuccess.value = '가입이 완료되었습니다. 로그인 화면으로 이동합니다.';
      setTimeout(() => {
        router.replace({ name: 'login', query: { email: form.email } as any });
      }, 600);
    }
  } catch (err: any) {
    const msg = err?.message || '가입 처리 중 오류가 발생했습니다.';
    if (/email/i.test(msg) && /in use|duplicate|중복/.test(msg)) {
      serverError.value = '이미 사용 중인 이메일입니다.';
    } else if (/nickname/i.test(msg) && /in use|duplicate|중복/.test(msg)) {
      serverError.value = '이미 사용 중인 닉네임입니다.';
    } else {
      serverError.value = msg;
    }
  } finally {
    submitting.value = false;
  }
}
</script>
<style sciped>
</style>