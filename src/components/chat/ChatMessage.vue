<script setup lang="ts">
import type { Message } from '@/types/chat'
import { useClipboard } from '@vueuse/core'
import StreamingMarkdown from './StreamingMarkdown.vue'

const props = defineProps<{
  message: Message
  isLastAiMessage?: boolean
  isStreamingMessage?: boolean
}>()

const contentRef = ref<HTMLElement | null>(null)
const isExpanded = ref(false)
const isLongMessage = ref(false)
const isCopied = ref(false)

const { copy } = useClipboard()

async function copyMessage() {
  await copy(props.message.content)
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}

// 메시지 길이 체크 (10줄 이상이면 긴 메시지로 판단)
const LINE_HEIGHT = 24 // leading-6 = 1.5rem = 24px
const MAX_LINES = 10

onMounted(() => {
  checkMessageLength()
})

watch(
  () => props.message.content,
  () => {
    nextTick(() => checkMessageLength())
  },
)

function checkMessageLength() {
  if (!contentRef.value) return
  const scrollHeight = contentRef.value.scrollHeight
  const maxHeight = LINE_HEIGHT * MAX_LINES
  isLongMessage.value = scrollHeight > maxHeight
}
</script>

<template>
  <!-- 사용자 메시지 -->
  <div v-if="message.role === 'user'" class="group flex flex-col mb-8">
    <div class="message-container max-w-md self-end">
      <div
        class="message rounded-2xl px-4 py-2 leading-6 dark:text-white"
        style="background: var(--chat-surface)"
      >
        <div
          ref="contentRef"
          class="message-content whitespace-pre-line wrap-break-word text-neutral-700 dark:text-white"
          :class="{ 'line-clamp-10': !isExpanded && isLongMessage }"
        >
          {{ message.content }}
        </div>
        <!-- 더보기/간략히 버튼 -->
        <button
          v-if="isLongMessage"
          class="mt-2 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? '간략히 보기' : '더보기' }}
        </button>
      </div>
      <!-- 복사 버튼 (오른쪽 아래) -->
      <div class="flex justify-end mt-1">
        <button
          class="copy-button opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
          title="복사"
          @click="copyMessage"
        >
          <svg
            v-if="!isCopied"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- AI 메시지 -->
  <div v-else class="group flex mb-8 flex-col">
    <div class="flex-1 flex flex-col justify-start w-full min-w-0">
      <div class="wrap-break-word min-w-0">
        <StreamingMarkdown :content="message.content" :is-streaming="false" />
      </div>
      <!-- 마지막 AI 메시지: 복사 버튼 + 경고 문구 (항상 보임, 스트리밍 완료 후) -->
      <div
        v-if="isLastAiMessage && !isStreamingMessage"
        class="flex flex-col items-end mt-2 gap-1"
      >
        <button
          class="copy-button p-1 rounded text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          title="복사"
          @click="copyMessage"
        >
          <svg
            v-if="!isCopied"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </button>
        <span class="text-xs text-neutral-400 dark:text-neutral-500">
          AI는 실수할 수 있습니다. 응답을 다시 한번 확인해 주세요.
        </span>
      </div>
      <!-- 이전 AI 메시지: 복사 버튼만 (hover시 보임, 스트리밍 중인 메시지 제외) -->
      <div v-else-if="!isStreamingMessage" class="flex justify-end mt-1">
        <button
          class="copy-button opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          title="복사"
          @click="copyMessage"
        >
          <svg
            v-if="!isCopied"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.copy-button {
  color: var(--chat-text);
}

.copy-button:hover {
  color: var(--chat-text-hover);
}
</style>
