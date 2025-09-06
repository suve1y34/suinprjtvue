<template>
  <dialog ref="dlg" class="modal modal--sm">
    <form class="modal__box" @submit.prevent="onSubmit">
      <header class="modal__head">
        <strong>내 정보 수정</strong>
        <button type="button" class="btn btn--outline-black" @click="close">✕</button>
      </header>

      <div class="form-col">
        <label class="form-label">이름</label>
        <input class="input" v-model.trim="form.userName" type="text" placeholder="이름" />
      </div>

      <div class="form-col">
        <label class="form-label">닉네임 <span style="color:var(--danger,#c22727)">*</span></label>
        <input class="input" v-model.trim="form.nickname" type="text" placeholder="닉네임" />
        <p v-if="fieldError" class="auth-error">{{ fieldError }}</p>
        <p v-if="serverError" class="auth-error">{{ serverError }}</p>
      </div>

      <div class="modal__actions">
        <button type="button" class="btn btn--outline-black" @click="close">취소</button>
        <button type="submit" class="btn btn--solid-gray" :disabled="submitting">
          {{ submitting ? '저장 중…' : '저장' }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import type { UserUpdatePayload } from "@/types/user";
import { ApiError } from "@/types/common";

const dlg = ref<HTMLDialogElement|null>(null);
const submitting = ref(false);
const fieldError = ref<string| null>(null);
const serverError = ref<string| null>(null);

const auth = useAuthStore();
const form = reactive<UserUpdatePayload>({ userName: "", nickname: "" });

function open() {
  if (!auth.accessToken || !auth.user) auth.loadMe();
  form.userName = auth.user?.userName ?? "";
  form.nickname = auth.user?.nickname ?? "";
  fieldError.value = null;
  serverError.value = null;
  dlg.value?.showModal();
}
function close() { dlg.value?.close(); }

async function onSubmit() {
  fieldError.value = null; serverError.value = null;
  if (!form.nickname) {
    fieldError.value = "닉네임은 필수입니다.";
    return;
  }
  submitting.value = true;
  try {
    await auth.updateMe({
      userName: form.userName || undefined,
      nickname: form.nickname || undefined,
    });
    close();
  } catch (e: any) {
    const err = e as ApiError;
    if (err.status === 409) serverError.value = "이미 사용 중인 닉네임입니다.";
    else serverError.value = err.message || "저장에 실패했습니다.";
  } finally {
    submitting.value = false;
  }
}

defineExpose({ open, close });
</script>

<style scoped>
</style>