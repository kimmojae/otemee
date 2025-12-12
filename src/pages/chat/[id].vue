<route lang="yaml">
name: chat
meta:
  title: Chat
</route>

<script setup lang="ts">
import { chatsApi } from '@/api/chats'
import ChatPrompt from '@/components/chat/ChatPrompt.vue'
import MessageList from '@/components/chat/MessageList.vue'
import { useChat, useStreamedMarkdown } from '@/composables/useChat'
import { useMessageAutoscroll } from '@/composables/useMessageAutoscroll'
import { useModelSettings } from '@/composables/useModelSettings'
import { useChatsStore } from '@/stores/chats'
import type { Message } from '@/types/chat'

const route = useRoute()
const router = useRouter()
const chatsStore = useChatsStore()
const { getDefaultModel } = useModelSettings()

const messages = ref<Message[]>([])
const isLoading = ref(false)
const isStreaming = ref(false)
const currentChatModel = ref<string>(getDefaultModel())
let loadingTimer: number | undefined
let abortController: AbortController | null = null

const chatId = computed(() => route.params.id as string)
const isNewChat = computed(() => chatId.value === 'new')

const { streamChat } = useChat()

const { containerRef, spacerHeight, handleNewUserMessage, showScrollToBottom, scrollToBottom } =
  useMessageAutoscroll({
    messages,
    isStreaming,
  })

// 기존 채팅 메시지 로드
const loadExistingChat = async (id: string) => {
  try {
    const chatDetail = await chatsApi.get(id)

    // 모델 정보 저장
    currentChatModel.value = chatDetail.model

    messages.value = chatDetail.messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.created_at,
    }))
    // DOM 렌더링 완료 후 스크롤 (Double RAF로 완전한 렌더링 대기)
    await nextTick()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToBottom()
      })
    })
  } catch {
    router.push('/chat/new')
  }
}

// 페이지 진입 시 처리
onMounted(async () => {
  const id = chatId.value
  if (!id) return

  if (isNewChat.value) {
    // "new"면 서버 조회 안함, 빈 상태로 시작
    chatsStore.setActiveChat(null)
    messages.value = []
    // 새 채팅: localStorage의 기본값 사용
    currentChatModel.value = getDefaultModel()
  } else {
    // 기존 채팅 로드
    chatsStore.setActiveChat(id)
    await loadExistingChat(id) // 여기서 currentChatModel.value 설정됨
  }
})

// 채팅 ID 변경 시 (다른 채팅으로 이동)
watch(chatId, async (newChatId, oldChatId) => {
  // 첫 로드는 onMounted에서 처리
  if (!oldChatId || !newChatId) return

  // 스트리밍 중 new → 실제 ID 전환은 무시 (chat_created 이벤트로 인한 URL 변경)
  if (oldChatId === 'new' && isStreaming.value) {
    chatsStore.setActiveChat(newChatId)
    return
  }

  if (newChatId === 'new') {
    chatsStore.setActiveChat(null)
    messages.value = []
    // 새 채팅: localStorage 사용
    currentChatModel.value = getDefaultModel()
  } else {
    chatsStore.setActiveChat(newChatId)
    await loadExistingChat(newChatId) // 여기서 currentChatModel.value 설정됨
  }
})

const handleMessageSubmit = async (content: string, model: string) => {
  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content,
    createdAt: new Date().toISOString(),
  }
  messages.value.push(userMessage)

  handleNewUserMessage()

  isStreaming.value = true
  abortController = new AbortController()

  loadingTimer = window.setTimeout(() => {
    isLoading.value = true
  }, 750)

  const aiMessage: Message = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: '',
    createdAt: new Date().toISOString(),
  }
  messages.value.push(aiMessage)

  const aiMessageIndex = messages.value.length - 1
  const { pushChunk, reset: resetMarkdown, getRaw } = useStreamedMarkdown()

  // 4ms 배치 처리 상태 (Ollama 방식)
  let buffer = ''
  let timeoutId: number | null = null
  let isFirstChunk = true

  await streamChat({
    message: content,
    chatId: chatId.value, // "new" 또는 실제 ID
    model,
    onChatCreated: (newChatId) => {
      // 새 채팅이 생성되면: 사이드바 업데이트 + URL 변경
      chatsStore.addOptimisticChat(newChatId, content, model)
      router.replace(`/chat/${newChatId}`)
    },
    onChunk: (chunk) => {
      if (loadingTimer) {
        clearTimeout(loadingTimer)
        loadingTimer = undefined
      }
      isLoading.value = false

      // 첫 청크: 반응성을 위해 즉시 표시
      if (isFirstChunk) {
        const rendered = pushChunk(chunk)
        const msg = messages.value[aiMessageIndex]
        if (msg) msg.content = rendered
        isFirstChunk = false
        return
      }

      // 이후 청크: 4ms throttling (Ollama 스타일)
      buffer += chunk

      // Throttling: 타이머가 없을 때만 시작 (일정한 간격 유지)
      if (!timeoutId) {
        timeoutId = window.setTimeout(() => {
          const rendered = pushChunk(buffer)
          const msg = messages.value[aiMessageIndex]
          if (msg) msg.content = rendered
          buffer = ''
          timeoutId = null
        }, 4) // ~250fps, 일정한 리듬
      }
    },
    onDone: () => {
      // 대기 중인 timeout 플러시
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      // 남은 buffer가 있으면 내부에만 추가 (Ollama 방식)
      if (buffer) {
        pushChunk(buffer)
        buffer = ''
      }

      // 최종 원본 텍스트로 설정
      const msg = messages.value[aiMessageIndex]
      if (msg) msg.content = getRaw()
      resetMarkdown()
      isStreaming.value = false
      isLoading.value = false
      abortController = null
    },
    onError: (error) => {
      console.error('Chat error:', error)

      // 대기 중인 throttling timeout 정리
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      if (buffer) {
        buffer = ''
      }

      // 에러 메시지 추가
      const msg = messages.value[aiMessageIndex]
      if (msg) msg.content += '\n\n오류가 발생했습니다. 다시 시도해주세요.'

      // 타이머와 상태 정리
      if (loadingTimer) {
        clearTimeout(loadingTimer)
        loadingTimer = undefined
      }
      isStreaming.value = false
      isLoading.value = false
      abortController = null
    },
    signal: abortController.signal,
  })
}

const handleCancel = () => {
  if (abortController) {
    abortController.abort()
    abortController = null
  }

  isStreaming.value = false
  isLoading.value = false

  if (loadingTimer) {
    clearTimeout(loadingTimer)
    loadingTimer = undefined
  }
}
</script>

<template>
  <div class="flex flex-col flex-1 overflow-hidden">
    <!-- 빈 채팅 -->
    <template v-if="messages.length === 0">
      <!-- Case 1: /chat/new - 로고만 크게, 입력창 중앙 -->
      <template v-if="isNewChat">
        <div class="flex flex-col flex-1 justify-center">
          <ChatPrompt
            v-model:selected-model="currentChatModel"
            :is-new-chat="true"
            :is-streaming="false"
            :has-messages="false"
            @submit="handleMessageSubmit"
          />
        </div>
      </template>

      <!-- Case 2: 생성된 빈 채팅 - 로고 작게 + 텍스트 한 줄 (중앙), 입력창 하단 -->
      <template v-else>
        <!-- 로고 + 환영 메시지 (중앙) -->
        <div class="flex flex-col flex-1 justify-center items-center">
          <div class="flex items-center gap-3">
            <!-- 로고 (작게) -->
            <div class="size-12">
              <img src="/logo.png" alt="Logo" class="w-full h-full object-cover" />
            </div>

            <!-- 환영 텍스트 -->
            <h1 class="text-2xl text-neutral-700 dark:text-neutral-200">
              오늘 무엇을 도와드릴까요?
            </h1>
          </div>
        </div>

        <!-- 입력창 (하단 고정) -->
        <div class="shrink-0">
          <ChatPrompt
            v-model:selected-model="currentChatModel"
            :is-new-chat="false"
            :is-streaming="false"
            :has-messages="false"
            @submit="handleMessageSubmit"
          />
        </div>
      </template>
    </template>

    <!-- 메시지가 있는 채팅 -->
    <template v-else>
      <div class="relative flex-1 min-h-0">
        <div ref="containerRef" class="h-full overflow-y-auto">
          <MessageList
            :messages="messages"
            :show-loading-dots="isLoading"
            :spacer-height="spacerHeight"
            :is-streaming="isStreaming"
          />
        </div>

        <!-- 스크롤 하단 버튼 -->
        <Transition
          enter-active-class="transition-opacity duration-200"
          leave-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <button
            v-if="showScrollToBottom"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 flex items-center justify-center shadow-lg cursor-pointer transition-colors"
            @click="scrollToBottom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-neutral-600 dark:text-neutral-300"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </Transition>
      </div>

      <div class="shrink-0">
        <ChatPrompt
          v-model:selected-model="currentChatModel"
          :is-new-chat="false"
          :is-streaming="isStreaming"
          :has-messages="messages.length > 0"
          @submit="handleMessageSubmit"
          @cancel="handleCancel"
        />
      </div>
    </template>
  </div>
</template>
