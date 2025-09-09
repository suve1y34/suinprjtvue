import { defineStore } from 'pinia';

export type ToastType = 'success' | 'error' | 'info';
export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  duration: number; // ms
}

let idSeq = 1;

export const useToastStore = defineStore('toast', {
  state: () => ({
    items: [] as ToastItem[],
    maxVisible: 4,
    defaultDuration: 2800,
  }),
  actions: {
    push(type: ToastType, message: string, duration?: number) {
      const item: ToastItem = {
        id: idSeq++,
        type,
        message,
        duration: duration ?? this.defaultDuration,
      };
      // 최대 표시 개수 제한 (앞에서 제거)
      if (this.items.length >= this.maxVisible) {
        this.items.shift();
      }
      this.items.push(item);

      // 자동 제거
      window.setTimeout(() => this.remove(item.id), item.duration);
    },
    success(message: string, duration?: number) { this.push('success', message, duration); },
    error(message: string, duration?: number) { this.push('error', message, duration); },
    info(message: string, duration?: number) { this.push('info', message, duration); },
    remove(id: number) {
      const i = this.items.findIndex(t => t.id === id);
      if (i >= 0) this.items.splice(i, 1);
    },
    // 전역 이벤트 바인딩 (http 인터셉터와 연동)
    bindGlobalListeners() {
      const onErr = (e: Event) => {
        const ce = e as CustomEvent<{ message?: string }>;
        const msg = ce.detail?.message ?? '요청 중 오류가 발생했습니다.';
        this.error(msg);
      };
      const onOk = (e: Event) => {
        const ce = e as CustomEvent<{ message?: string }>;
        const msg = ce.detail?.message ?? '완료되었습니다.';
        this.success(msg);
      };
      window.addEventListener('toast:error', onErr);
      window.addEventListener('toast:success', onOk);
    },
  },
});