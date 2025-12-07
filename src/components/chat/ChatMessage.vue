<template>
  <!-- 사용자 메시지 -->
  <div v-if="message.role === 'user'" class="flex flex-col mb-8">
    <div class="message-container max-w-md self-end">
      <div
        class="message rounded-3xl bg-neutral-100 px-4 py-2 leading-6 dark:bg-neutral-700 dark:text-white"
      >
        <div
          class="message-content whitespace-pre-line wrap-break-word text-neutral-700 dark:text-white"
        >
          {{ message.content }}
        </div>
      </div>
    </div>
  </div>

  <!-- AI 메시지 -->
  <div v-else class="flex mb-8 flex-col">
    <div class="flex-1 flex flex-col justify-start w-full min-w-0">
      <div class="wrap-break-word min-w-0">
        <StreamingMarkdown :content="message.content" :is-streaming="false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StreamingMarkdown from './StreamingMarkdown.vue'
import type { Message } from '@/types/chat'

defineProps<{
  message: Message
}>()
</script>
