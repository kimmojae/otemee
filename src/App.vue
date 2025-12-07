<script setup lang="ts">
import { useDark } from '@vueuse/core'

useDark()
</script>

<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  -webkit-app-region: no-drag;
}
</style>
