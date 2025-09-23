import { ref, computed } from 'vue';
import type { ShelfUpsertForm } from '@/domain/shelf';
import type { ReadingStatus } from '@/types/shelf';

export function useShelfForm() {
  const form = ref<ShelfUpsertForm>({
    mode: 'add',
    book: {},
    status: 'PLAN',
    currentPage: 0,
    memo: '',
    review: '',
    reviewPublic: false,
    rating: null,
    startDate: null,
    endDate: null,
  });

  const percentValue = computed(() => {
    const tp = typeof form.value.totalPages === 'number' ? form.value.totalPages : 0;
    if (!tp) return 0;
    if (form.value.status === 'DONE') return 100;
    const cp = Math.max(0, Math.min(form.value.currentPage || 0, tp));
    return Math.floor((cp / tp) * 100);
  });

  function setStatus(next: ReadingStatus) {
    form.value.status = next;
    const today = new Date().toISOString().slice(0,10);
    if (next === 'READING') {
      if (!form.value.startDate) form.value.startDate = today;
      form.value.endDate = null;
    } else if (next === 'DONE') {
      if (!form.value.startDate) form.value.startDate = today;
      if (!form.value.endDate) form.value.endDate = today;
    } else {
      form.value.startDate = null;
      form.value.endDate = null;
    }
  }

  return { form, percentValue, setStatus };
}