<template>
  <dialog ref="dlg" class="modal modal--sm">

    <form class="modal__box" @submit.prevent="onSave">
      <header class="modal__head">
        <strong>내 정보</strong>
        <button type="button" class="btn btn--outline-black" @click="close">✕</button>
      </header>

      <div v-if="!me" class="info__row">로그인이 필요합니다.</div>

      <template v-else>
        <div class="info__grid">
          <div class="info__row">
            <div class="info__label">이메일</div>
            <div class="info__value">{{ me.email }}</div>
          </div>

          <div class="info__row">
            <div class="info__label">이름</div>
            <div class="info__value">{{ me.userName }}</div>
          </div>

          <div class="info__row">
            <div class="info__label">닉네임</div>
            <div class="info__value">
              <input
                class="input"
                type="text"
                v-model.trim="nickInput"
                :maxlength="16"
                placeholder="닉네임 (2~16자)"
              />
              <p v-if="nickError" class="field-error">{{ nickError }}</p>
            </div>
          </div>

          <div class="info__row">
            <div class="info__label">연락처</div>
            <div class="info__value">
              <input
                class="input"
                type="text"
                v-model.trim="phoneInput"
                :maxlength="20"
                placeholder="010-1234-5678"
              />
              <p v-if="phoneError" class="field-error">{{ phoneError }}</p>
            </div>
          </div>

          <div class="info__row">
            <div class="info__label">연간 독서 목표</div>
            <div class="info__value">
              <input
                class="input"
                type="number"
                v-model.number="goalInput"
                min="1"
                max="999"
                placeholder="올해 목표 책 수"
              />
              <p v-if="goalError" class="field-error">{{ goalError }}</p>
            </div>
          </div>
          
          <div class="modal__actions">
            <button
              type="submit"
              class="btn btn--solid-gray"
              :disabled="dirty && (busy || !!nickError || !!phoneError || !!goalError)"
            >
              {{ busy ? '저장 중…' : '저장' }}
            </button>
        </div>
        </div>
      </template>
    </form>
  </dialog>
</template>
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAuthStore } from "@/stores";
import type { UserUpdatePayload } from "@/types/user";

const dlg = ref<HTMLDialogElement|null>(null);
const auth = useAuthStore();
const me = computed(() => auth.user);

const busy = ref(false);

// 입력값
const nickInput  = ref("");
const phoneInput = ref("");
const goalInput  = ref<number | null>(null);

// 초기 스냅샷(변경 여부 비교용)
const initialNick  = ref("");
const initialPhone = ref("");
const initialGoal  = ref<number | null>(null);

/** 현재 auth.user로부터 입력 필드/스냅샷을 재프라임 */
function primeFieldsFromStore() {
  initialNick.value  = auth.user?.nickname ?? "";
  initialPhone.value = auth.user?.userPhone ?? "";
  initialGoal.value  = typeof auth.user?.goalYearlyCount === 'number'
    ? auth.user!.goalYearlyCount!
    : null;

  nickInput.value  = initialNick.value;
  phoneInput.value = initialPhone.value;
  goalInput.value  = initialGoal.value;
}

/** 서버에서 me 재조회 후 store 동기화 */
async function refreshMeFromServer() {
  if (!auth.accessToken) {
    auth.user = null;
    return;
  }
  try {
    await auth.fetchMe(true); // 강제 재조회
  } catch {
    // 전역 인터셉터(401 등)에서 처리
  }
}

// 열기/닫기
function close() { dlg.value?.close(); }
async function open() {
  await refreshMeFromServer(); // 항상 최신
  primeFieldsFromStore();      // 한 번만 프라임
  dlg.value?.showModal();
}
defineExpose({ open, close });

// 닉네임 유효성
const nickError = computed(() => {
  const v = nickInput.value?.trim() ?? "";
  if (v.length === 0) return "닉네임을 입력해 주세요.";
  if (v.length < 2) return "닉네임은 2자 이상이어야 합니다.";
  if (v.length > 16) return "닉네임은 16자 이하여야 합니다.";
  const ok = /^[A-Za-z0-9가-힣_\-\s]+$/.test(v);
  if (!ok) return "사용할 수 없는 문자가 포함되었습니다.";
  return "";
});

// 연락처 유효성 (010-0000-0000 형태 or 공란 허용)
const phoneError = computed(() => {
  const v = phoneInput.value?.trim() ?? "";
  if (v.length === 0) return ""; // 선택 입력
  const ok = /^01[0-9]-?\d{3,4}-?\d{4}$/.test(v);
  if (!ok) return "연락처 형식이 올바르지 않습니다.";
  return "";
});

const goalError = computed(() => {
  if (goalInput.value == null || goalInput.value === 0) return ""; // 미설정 허용
  if (goalInput.value < 0) return "0 이상을 입력하세요.";
  if (!Number.isInteger(goalInput.value)) return "정수를 입력하세요.";
  if (goalInput.value > 999) return "너무 큰 값입니다.";
  return "";
});

// 변경 여부(dirty)
const dirty = computed(() => {
  return (
    nickInput.value.trim()  !== initialNick.value ||
    phoneInput.value.trim() !== initialPhone.value ||
    (goalInput.value ?? null) !== (initialGoal.value ?? null)
  );
});

async function onSave() {
  if (busy.value || nickError.value || phoneError.value || goalError.value) return;
  if (!dirty.value) return;

  const ok = window.confirm('변경 내용을 저장할까요?');
  if (!ok) return;

  busy.value = true;
  try {
    const payload: UserUpdatePayload = {
      nickname:  nickInput.value.trim(),
      userPhone: phoneInput.value.trim(),
      ...(goalInput.value == null ? {} : { goalYearlyCount: goalInput.value }),
    };

    await auth.updateMe(payload); // 서버 저장 + store 일부 갱신
    await refreshMeFromServer();  // 서버 기준 최신 동기화
    await auth.fetchGoalProgress().catch(()=>{});
    primeFieldsFromStore();       // 스냅샷 갱신

    window.dispatchEvent(new CustomEvent('toast:info', { detail: { message: '내 정보가 저장되었습니다.' } }));
    close();
  } catch (e: any) {
    window.dispatchEvent(new CustomEvent('toast:error', { detail: { message: e?.message ?? '저장 실패' } }));
  } finally {
    busy.value = false;
  }
}

// store user가 바뀌면, 모달이 열린 상태에서 즉시 반영
watch(
  () => auth.user,
  () => {
    if (dlg.value?.open) {
      primeFieldsFromStore();
    }
  }
);
</script>