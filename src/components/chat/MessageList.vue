<script setup lang="ts">
import type { Message } from '@/types/chat'
import ChatMessage from './ChatMessage.vue'

const props = defineProps<{
  messages: Message[]
  showLoadingDots?: boolean
  spacerHeight?: number
  isStreaming?: boolean
}>()

// 마지막 AI 메시지인지 확인 (스트리밍 완료 후에만 true)
const isLastAiMessage = (idx: number) => {
  // 스트리밍 중이면 false
  if (props.isStreaming) return false

  const message = props.messages[idx]
  if (message?.role !== 'assistant') return false

  // 현재 메시지 이후에 assistant 메시지가 있는지 확인
  for (let i = idx + 1; i < props.messages.length; i++) {
    if (props.messages[i]?.role === 'assistant') return false
  }
  return true
}

// 현재 스트리밍 중인 메시지인지 확인 (마지막 AI 메시지 + 스트리밍 중)
const isStreamingMessage = (idx: number) => {
  if (!props.isStreaming) return false

  const message = props.messages[idx]
  if (message?.role !== 'assistant') return false

  // 마지막 메시지인지 확인
  return idx === props.messages.length - 1
}
</script>

<template>
  <div
    class="mx-auto flex max-w-[768px] flex-1 flex-col px-6 pb-12 select-text w-full overflow-x-hidden"
    data-role="message-list"
  >
    <div v-for="(message, idx) in messages" :key="message.id" :data-message-index="idx">
      <ChatMessage
        :message="message"
        :is-last-ai-message="isLastAiMessage(idx)"
        :is-streaming-message="isStreamingMessage(idx)"
      />
    </div>

    <!-- 로딩 dots (AI 응답 대기 중) -->
    <div
      v-if="showLoadingDots"
      class="flex items-center space-x-1.5 py-3 mt-2 self-start rounded-full px-4 min-w-0 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
    >
      <div
        class="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full opacity-0"
        style="animation: typing 1.4s infinite; animation-delay: 0s"
      />
      <div
        class="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full opacity-0"
        style="animation: typing 1.4s infinite; animation-delay: 0.15s"
      />
      <div
        class="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full opacity-0"
        style="animation: typing 1.4s infinite; animation-delay: 0.3s"
      />
    </div>

    <!-- Dynamic spacer to allow scrolling the last message to the top of the container -->
    <div :style="{ height: `${spacerHeight}px` }" aria-hidden="true" />
  </div>
</template>
