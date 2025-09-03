<template>
  <dialog ref="dlg" class="modal modal--sm">
    <section class="modal__box">
      <header class="modal__head">
        <strong>내 정보</strong>
        <button type="button" class="btn btn--outline-black" @click="close">✕</button>
      </header>

      <div v-if="!me" class="info__row">로그인이 필요합니다.</div>
      <template v-else>
        <div class="info__grid">
          <div class="info__row"><div class="info__label">이메일</div><div class="info__value">{{ me.email }}</div></div>
          <div class="info__row"><div class="info__label">이름</div><div class="info__value">{{ me.userName }}</div></div>
          <div class="info__row"><div class="info__label">닉네임</div><div class="info__value">{{ me.nickname || '—' }}</div></div>
        </div>

        <div class="modal__actions">
          <button type="button" class="btn btn--solid-gray" @click="close">닫기</button>
        </div>
      </template>
    </section>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth.store";

const dlg = ref<HTMLDialogElement|null>(null);
const auth = useAuthStore();
const me = computed(() => auth.user);

function close() { dlg.value?.close(); }
function open() {
  // 저장된 토큰/유저 복원만 사용
  if (!auth.accessToken || !auth.user) auth.loadMe();
  dlg.value?.showModal();
}

defineExpose({ open, close });
</script>