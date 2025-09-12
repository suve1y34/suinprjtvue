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
          
          <div class="info__row" style="justify-content:flex-end; gap:8px; margin-top:16px;">
          <button
            v-if="dirty"
            type="submit"
            class="btn btn--solid-gray"
            :disabled="busy || !!nickError || !!phoneError || !!goalError"
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
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores";
import type { UserUpdatePayload } from "@/types/user";

const dlg = ref<HTMLDialogElement|null>(null);
const auth = useAuthStore();
const me = computed(() => auth.user);

const busy = ref(false);

// 입력값
const nickInput = ref("");
const phoneInput = ref("");

// 초기 스냅샷(변경 여부 비교용)
const initialNick = ref("");
const initialPhone = ref("");

const goalInput = ref<number | null>(null);
const initialGoal = ref<number | null>(null);

// 열기/닫기
function close() { dlg.value?.close(); }
function open() {
  if (!auth.accessToken || !auth.user) auth.loadMe();
  dlg.value?.showModal();

  initialNick.value  = auth.user?.nickname   ?? "";
  initialPhone.value = auth.user?.userPhone ?? "";
  initialGoal.value  = typeof auth.user?.goalYearlyCount === 'number' ? auth.user!.goalYearlyCount! : null;

  nickInput.value  = initialNick.value;
  phoneInput.value = initialPhone.value;
  goalInput.value  = initialGoal.value;
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
  if (goalInput.value == null || goalInput.value === undefined || goalInput.value === 0) return ""; // 미설정 허용
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

// 저장 버튼 노출 조건
const showSave = computed(() => dirty.value);

async function onSave() {
  if (busy.value || nickError.value || phoneError.value) return;
  if (!dirty.value) return;

  busy.value = true;
  try {
    const payload: UserUpdatePayload = {
      nickname:  nickInput.value.trim(),
      userPhone: phoneInput.value.trim(),
      ...(goalInput.value == null ? {} : { goalYearlyCount: goalInput.value }),
    };
    console.log(payload);
    await auth.updateMe(payload);

    // 저장 후 초기 스냅샷 갱신
    initialNick.value  = nickInput.value.trim();
    initialPhone.value = phoneInput.value.trim();
    initialGoal.value  = goalInput.value ?? null;

    window.dispatchEvent(new CustomEvent('toast:info', { detail: { message: '내 정보가 저장되었습니다.' } }));
    close();
  } catch (e: any) {
    window.dispatchEvent(new CustomEvent('toast:error', { detail: { message: e?.message ?? '저장 실패' } }));
  } finally {
    busy.value = false;
  }
}
</script>