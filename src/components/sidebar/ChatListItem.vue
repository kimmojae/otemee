<script setup lang="ts">
import type { Chat } from '@/types/chat'

interface Props {
  chat: Chat
  isActive: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="group flex items-center gap-2 rounded-lg px-3 py-1.5 mx-2 cursor-pointer transition-colors"
    :class="{
      'bg-neutral-100 dark:bg-neutral-800': isActive,
      'hover:bg-neutral-100 dark:hover:bg-neutral-800': !isActive,
    }"
    @click="emit('click')"
  >
    <span class="flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">{{
      chat.title
    }}</span>
  </div>
</template>
