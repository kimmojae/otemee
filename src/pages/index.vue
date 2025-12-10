<route lang="yaml">
name: home
meta:
  title: Home
</route>

<script setup lang="ts">
const router = useRouter()

// 홈 페이지 진입 시 /chat/new로 리다이렉트
onMounted(() => {
  router.replace('/chat/new')
})
</script>

<template>
  <div />
</template>
