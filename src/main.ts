import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from '@/router';
import { useAuthStore } from '@/stores/auth.store';

const app = createApp(App);
app.use(createPinia());
app.use(router);

// 앱 부팅 시 저장소 → 스토어로 복원
const auth = useAuthStore();
auth.loadMe();

// 전역 401 이벤트 발생 시 로그인 화면으로
window.addEventListener('auth:unauthorized', () => {
  auth.logout();
  router.replace({ name: 'login' });
});

app.mount('#app');