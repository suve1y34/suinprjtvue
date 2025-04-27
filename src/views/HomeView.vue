<template>
  <div>
    <h1>홈 화면입니다!</h1>
    <button @click="fetchTest">API 호출</button>
    <p>{{ result }}</p>
  </div>
</template>

<script setup lang="ts">
import axios from '@/lib/axios'
import { ref } from 'vue'

const result = ref('')

const fetchTest = async () => {
  try {
    const res = await axios.get('/')
    result.value = JSON.stringify(res.data)
  } catch (error) {
    result.value = '에러 발생'
    console.error(error)
  }
}
</script>
