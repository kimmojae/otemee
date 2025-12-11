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
import { useChatsStore } from '@/stores/chats'
import type { Message } from '@/types/chat'

const route = useRoute()
const router = useRouter()
const chatsStore = useChatsStore()

const messages = ref<Message[]>([])
const isLoading = ref(false)
const isStreaming = ref(false)
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
    messages.value = chatDetail.messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.created_at,
    }))
    // DOM 렌더링 완료 후 스크롤 (약간의 딜레이로 watch 간섭 방지)
    setTimeout(() => {
      scrollToBottom()
    }, 50)
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
  } else {
    // 기존 채팅 로드
    chatsStore.setActiveChat(id)
    await loadExistingChat(id)
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
  } else {
    chatsStore.setActiveChat(newChatId)
    await loadExistingChat(newChatId)
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
  let rafId: number | null = null

  await streamChat({
    message: content,
    chatId: chatId.value, // "new" 또는 실제 ID
    model,
    onChatCreated: (newChatId) => {
      // 새 채팅이 생성되면: 사이드바 업데이트 + URL 변경
      chatsStore.addOptimisticChat(newChatId, content)
      router.replace(`/chat/${newChatId}`)
    },
    onChunk: (chunk) => {
      if (loadingTimer) {
        clearTimeout(loadingTimer)
        loadingTimer = undefined
      }
      isLoading.value = false
      const rendered = pushChunk(chunk)
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          const msg = messages.value[aiMessageIndex]
          if (msg) msg.content = rendered
          rafId = null
        })
      }
    },
    onDone: () => {
      const msg = messages.value[aiMessageIndex]
      if (msg) msg.content = getRaw()
      resetMarkdown()
      isStreaming.value = false
      isLoading.value = false
      abortController = null
    },
    onError: (error) => {
      console.error('Chat error:', error)
      const msg = messages.value[aiMessageIndex]
      if (msg) msg.content += '\n\n오류가 발생했습니다. 다시 시도해주세요.'
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
    <!-- 새 채팅: 중앙 정렬된 입력창 -->
    <template v-if="isNewChat && messages.length === 0">
      <div class="flex flex-col flex-1 justify-center">
        <ChatPrompt :is-new-chat="true" :is-streaming="false" @submit="handleMessageSubmit" />
      </div>
    </template>

    <!-- 기존 채팅 또는 진행 중인 대화 -->
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
          :is-new-chat="false"
          :is-streaming="isStreaming"
          @submit="handleMessageSubmit"
          @cancel="handleCancel"
        />
      </div>
    </template>
  </div>
</template>
