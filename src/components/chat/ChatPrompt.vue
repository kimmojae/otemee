<script setup lang="ts">
import ModelPicker from './ModelPicker.vue'

const props = defineProps<{
  isNewChat?: boolean
  isStreaming?: boolean
  selectedModel?: string
}>()

const emit = defineEmits<{
  submit: [content: string, model: string]
  cancel: []
  'update:selectedModel': [model: string]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const messageContent = ref('')

// 기본 모델 설정 (localStorage에서 복원하거나 기본값 사용)
const DEFAULT_MODEL = 'gemma3:1b'
const localModel = ref(
  props.selectedModel || localStorage.getItem('selectedModel') || DEFAULT_MODEL,
)

// 모델 변경 시 localStorage에 저장
watch(localModel, (newModel) => {
  localStorage.setItem('selectedModel', newModel)
  emit('update:selectedModel', newModel)
})

// 전송 가능 여부
const canSubmit = computed(() => messageContent.value.trim().length > 0)

// Textarea 자동 높이 조절
const handleTextareaInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  target.style.height = 'auto'
  target.style.height = Math.min(target.scrollHeight, 24 * 8) + 'px'
}

// Enter 키 처리 (한글 입력 고려)
const handleKeyDown = (e: KeyboardEvent) => {
  // Enter + Shift: 줄바꿈 허용
  if (e.key === 'Enter' && e.shiftKey) {
    return
  }

  // Enter만 눌렀을 때: 전송
  // e.isComposing으로 한글 입력 중인지 체크 (브라우저 내장 플래그)
  if (e.key === 'Enter' && !e.isComposing) {
    e.preventDefault()
    handleSubmit()
  }
}

// 메시지 전송
const handleSubmit = () => {
  if (!canSubmit.value) return

  const content = messageContent.value.trim()
  emit('submit', content, localModel.value)

  // 입력창 초기화
  messageContent.value = ''
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

// 전송 취소
const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="pb-3 px-3">
    <!-- 로고 (새 채팅일 때) -->
    <div v-if="isNewChat" class="mb-8 flex justify-center">
      <div
        class="size-18 bg-neutral-300 dark:bg-white rounded-full flex items-center justify-center"
      >
        <img src="/logo.png" alt="Logo" class="w-full h-full object-contain" />
      </div>
    </div>

    <!-- 입력 컨테이너 -->
    <div
      class="relative mx-auto flex w-full max-w-[768px] flex-col items-center rounded-2xl pb-2 pt-4 min-h-[88px]"
      style="background: var(--chat-surface)"
    >
      <!-- Textarea -->
      <div class="relative w-full px-5">
        <textarea
          ref="textareaRef"
          v-model="messageContent"
          placeholder="Send a message"
          class="w-full overflow-y-auto text-neutral-700 outline-none resize-none border-none bg-transparent dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 min-h-[24px] leading-6"
          rows="1"
          @input="handleTextareaInput"
          @keydown="handleKeyDown"
        />
      </div>

      <!-- 컨트롤 버튼들 -->
      <div class="flex w-full items-center justify-between px-3 pt-2">
        <!-- 왼쪽: 첨부 버튼 (추후 구현) -->
        <div class="flex items-center">
          <!-- <button
            type="button"
            class="flex items-center justify-center h-9 w-9 rounded-full text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
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
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button> -->
        </div>

        <!-- 오른쪽: 모델 선택 + 전송 버튼 -->
        <div class="flex items-center gap-2">
          <ModelPicker v-model="localModel" />
          <button
            ref="submitButtonRef"
            :disabled="!canSubmit && !isStreaming"
            class="flex items-center justify-center h-9 w-9 rounded-full cursor-pointer bg-black text-white dark:bg-white dark:text-black disabled:opacity-10 disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500"
            @click="isStreaming ? handleCancel() : handleSubmit()"
          >
            <!-- Stop 아이콘 (스트리밍 중) -->
            <svg
              v-if="isStreaming"
              class="h-3 w-3 fill-current"
              viewBox="0 0 15 15"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 12.3838C0 13.6055 0.738281 14.3262 1.96875 14.3262H12.3486C13.5879 14.3262 14.3174 13.6055 14.3174 12.3838V1.94238C14.3174 0.720703 13.5879 0 12.3486 0H1.96875C0.738281 0 0 0.720703 0 1.94238V12.3838Z"
              />
            </svg>

            <!-- 전송 아이콘 (일반) -->
            <svg
              v-else
              class="h-3.5 w-3.5 fill-current"
              viewBox="0 0 14 17"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.918802 7.73542C1.19144 7.73542 1.43401 7.63188 1.60065 7.45804L3.59348 5.48929L6.7957 1.89614L10.0107 5.48929L12.0067 7.45804C12.179 7.63188 12.416 7.73542 12.6886 7.73542C13.2182 7.73542 13.6074 7.33974 13.6074 6.80466C13.6074 6.54785 13.5149 6.3174 13.3131 6.10998L7.51833 0.306385C7.32603 0.106874 7.06851 0 6.8029 0C6.5373 0 6.2782 0.106874 6.08748 0.306385L0.299881 6.10998C0.0996671 6.3174 0 6.54785 0 6.80466C0 7.33974 0.389177 7.73542 0.918802 7.73542ZM6.8029 16.6848C7.36909 16.6848 7.76073 16.2909 7.76073 15.7136V4.79494L7.65544 1.93059C7.65544 1.40993 7.31091 1.06066 6.8029 1.06066C6.29332 1.06066 5.94879 1.40993 5.94879 1.93059L5.8435 4.79494V15.7136C5.8435 16.2909 6.23672 16.6848 6.8029 16.6848Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
