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

          <!-- 닉네임 -->
          <div class="info__row">
            <div class="info__label">닉네임</div>

            <!-- 보기 모드 -->
            <div v-if="!editing" class="info__value nick-view">
              <span class="nick-text">{{ me.nickname || '—' }}</span>
              <button
                type="button"
                class="icon-btn nick-edit-btn"
                title="닉네임 수정"
                aria-label="닉네임 수정"
                @click="startEdit"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/>
                  <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0L14.13 4.7l3.75 3.75 2.83-2.83z" fill="currentColor"/>
                </svg>
              </button>
            </div>

            <!-- 닉네임만 수정 가능 -->
            <div v-else class="info__value nick-edit">
              <input
                ref="nickInputEl"
                class="input nick-input"
                type="text"
                v-model.trim="nickInput"
                :maxlength="16"
                placeholder="닉네임 (2~16자)"
              />

              <div class="edit-actions">
                <button type="button" class="btn btn--outline-black" @click="cancelEdit" :disabled="busy">
                  취소
                </button>
                <button type="submit" class="btn btn--solid-gray" :disabled="busy || !!nickError">
                  {{ busy ? '저장 중…' : '저장' }}
                </button>
              </div>

              <p v-if="nickError" class="field-error">{{ nickError }}</p>
              <p v-else class="field-hint">한글/영문/숫자/하이픈/밑줄 · 2~16자 권장</p>
            </div>
          </div>
        </div>
      </template>
    </form>
  </dialog>
</template>
<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useAuthStore } from "@/stores";
import type { UserUpdatePayload } from "@/types/user";

const dlg = ref<HTMLDialogElement|null>(null);
const auth = useAuthStore();
const me = computed(() => auth.user);

const editing = ref(false);
const busy = ref(false);
const nickInput = ref("");
const nickInputEl = ref<HTMLInputElement|null>(null);

function close() { dlg.value?.close(); }
function open() {
  // 저장된 토큰/유저 복원만 사용 (없으면 재조회)
  if (!auth.accessToken || !auth.user) auth.loadMe();
  dlg.value?.showModal();
  // 닉네임 초기 세팅
  nickInput.value = auth.user?.nickname ?? "";
  editing.value = false;
}

function startEdit() {
  nickInput.value = auth.user?.nickname ?? "";
  editing.value = true;
  nextTick(() => nickInputEl.value?.focus());
}
function cancelEdit() {
  editing.value = false;
  nickInput.value = auth.user?.nickname ?? "";
}

/** 닉네임 유효성: 2~16, 허용 문자 */
const nickError = computed(() => {
  const v = nickInput.value?.trim() ?? "";
  if (v.length === 0) return "닉네임을 입력해 주세요.";
  if (v.length < 2) return "닉네임은 2자 이상이어야 합니다.";
  if (v.length > 16) return "닉네임은 16자 이하여야 합니다.";
  // 한글/영문/숫자/하이픈/밑줄/공백 일부 허용 (앞뒤 공백은 trim)
  const ok = /^[A-Za-z0-9가-힣_\-\s]+$/.test(v);
  if (!ok) return "사용할 수 없는 문자가 포함되었습니다.";
  return "";
});

async function onSave() {
  if (!editing.value || busy.value) return;
  if (nickError.value) return;

  const next = nickInput.value.trim();
  if (next === (auth.user?.nickname ?? "")) {
    editing.value = false;
    return;
  }

  busy.value = true;
  try {
    const payload: UserUpdatePayload = { nickname: next };
    await auth.updateMe(payload);

    try {
      window.dispatchEvent(new CustomEvent('toast:info', { detail: { message: '닉네임이 저장되었습니다.' } }));
    } catch {}
    editing.value = false;
  } catch (e: any) {
    const msg = e?.message ?? "닉네임 저장 실패";
    try {
      window.dispatchEvent(new CustomEvent('toast:error', { detail: { message: msg } }));
    } catch {}
  } finally {
    busy.value = false;
  }
}

defineExpose({ open, close });
</script>