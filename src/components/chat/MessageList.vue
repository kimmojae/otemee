<template>
  <div class="mx-auto flex max-w-[768px] flex-1 flex-col px-6 pb-12 select-text w-full overflow-x-hidden" data-role="message-list">
    <div v-for="(message, idx) in messages" :key="message.id" :data-message-index="idx">
      <ChatMessage :message="message" />
    </div>

    <!-- 로딩 dots (AI 응답 대기 중) -->
    <div v-if="showLoadingDots" class="flex items-center space-x-1.5 py-3 mt-2 self-start rounded-full px-4 min-w-0 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
      <div
        class="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full opacity-0"
        style="animation: typing 1.4s infinite; animation-delay: 0s;"
      />
      <div
        class="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full opacity-0"
        style="animation: typing 1.4s infinite; animation-delay: 0.15s;"
      />
      <div
        class="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full opacity-0"
        style="animation: typing 1.4s infinite; animation-delay: 0.3s;"
      />
    </div>

    <!-- Dynamic spacer to allow scrolling the last message to the top of the container -->
    <div :style="{ height: `${spacerHeight}px` }" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import ChatMessage from './ChatMessage.vue'
import type { Message } from '@/types/chat'

defineProps<{
  messages: Message[]
  showLoadingDots?: boolean
  spacerHeight?: number
}>()
</script>
