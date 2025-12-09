<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useDark, useToggle } from '@vueuse/core'

const sidebarStore = useSidebarStore()
const { isOpen } = storeToRefs(sidebarStore)
const { toggle } = sidebarStore

const chatsStore = useChatsStore()

const isDark = useDark()
const toggleDark = useToggle(isDark)

const handleDoubleClick = () => {
  if (window.electronAPI?.doubleClick) {
    window.electronAPI.doubleClick()
  }
}

const handleNewChat = () => {
  chatsStore.addChat('New Chat')
}
</script>

<template>
  <div class="flex h-full bg-white dark:bg-neutral-900">
    <!-- 헤더 (타이틀바) -->
    <header class="absolute inset-x-0 top-0 h-12 z-10 drag-region" @dblclick="handleDoubleClick">
      <!-- 좌측: 사이드바 토글 + 새 채팅 버튼 -->
      <div
        class="absolute flex px-2 py-2.5 items-center transition-[left] duration-300 text-neutral-500 dark:text-neutral-400 no-drag"
        :class="isOpen ? 'left-[212px]' : 'left-22'"
      >
        <button
          @click="toggle"
          @mousedown.stop
          class="h-9 w-9 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700/75 cursor-pointer transition-colors"
          :aria-label="isOpen ? 'Hide sidebar' : 'Show sidebar'"
          :title="isOpen ? 'Hide sidebar' : 'Show sidebar'"
        >
          <svg
            class="h-5 w-5 fill-current"
            viewBox="0 0 24 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.76132 16.6344H9.58103V1.59842H7.76132V16.6344ZM4.20898 18.2316H19.124C21.6518 18.2316 23.1293 16.6963 23.1293 14.0209V4.2205C23.1293 1.54512 21.6518 0.00351715 19.124 0.00351715H4.20898C1.54336 0.00351715 0 1.54512 0 4.2205V14.0209C0 16.6963 1.54336 18.2316 4.20898 18.2316ZM4.31191 16.3184C2.79628 16.3184 1.91327 15.4434 1.91327 13.926V4.31542C1.91327 2.79979 2.79628 1.91678 4.31191 1.91678H18.8174C20.333 1.91678 21.216 2.79979 21.216 4.31542V13.926C21.216 15.4434 20.333 16.3184 18.8174 16.3184H4.31191ZM5.85116 5.50038C6.1951 5.50038 6.49217 5.20507 6.49217 4.87968C6.49217 4.54628 6.1951 4.25722 5.85116 4.25722H3.8412C3.49725 4.25722 3.20819 4.54628 3.20819 4.87968C3.20819 5.20507 3.49725 5.50038 3.8412 5.50038H5.85116ZM5.85116 8.1158C6.1951 8.1158 6.49217 7.82049 6.49217 7.4871C6.49217 7.1537 6.1951 6.8744 5.85116 6.8744H3.8412C3.49725 6.8744 3.20819 7.1537 3.20819 7.4871C3.20819 7.82049 3.49725 8.1158 3.8412 8.1158H5.85116ZM5.85116 10.725C6.1951 10.725 6.49217 10.4439 6.49217 10.1105C6.49217 9.77713 6.1951 9.48983 5.85116 9.48983H3.8412C3.49725 9.48983 3.20819 9.77713 3.20819 10.1105C3.20819 10.4439 3.49725 10.725 3.8412 10.725H5.85116Z"
            />
          </svg>
        </button>

        <!-- 새 채팅 버튼 (사이드바 닫혔을 때만 표시) -->
        <button
          @click="handleNewChat"
          @mousedown.stop
          title="New chat"
          class="flex ml-1 items-center justify-center rounded-full h-9 w-9 hover:bg-neutral-100 dark:hover:bg-neutral-700/75 cursor-pointer transition-opacity duration-300"
          :class="isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'"
        >
          <svg
            class="h-5 w-5 fill-current"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.0859 3.39949L15.2135 5.27196H7.27028C5.78649 5.27196 4.94684 6.11336 4.94684 7.59716V16.664C4.94684 18.1558 5.78649 18.9892 7.27028 18.9892H16.3406C17.8324 18.9892 18.6623 18.1558 18.6623 16.664V8.79514L20.5428 6.9115C20.567 7.11532 20.5773 7.33066 20.5773 7.55419V16.7149C20.5773 19.4069 19.0818 20.9024 16.3898 20.9024H7.22107C4.53708 20.9024 3.03357 19.4069 3.03357 16.7149V7.55419C3.03357 4.8622 4.53708 3.35869 7.22107 3.35869H16.3898C16.6329 3.35869 16.8662 3.37094 17.0859 3.39949Z"
            />
            <path
              d="M9.92714 14.381L11.914 13.5403L20.8312 4.63114L19.3404 3.1581L10.433 12.0655L9.55234 13.9964C9.45664 14.2169 9.70293 14.4714 9.92714 14.381ZM21.5767 3.89364L22.2588 3.19384C22.6347 2.80184 22.6435 2.2663 22.2711 1.90536L22.0148 1.64287C21.6822 1.31377 21.1334 1.36513 20.7689 1.72158L20.0859 2.39833L21.5767 3.89364Z"
            />
          </svg>
        </button>
      </div>

      <!-- 우측: 다크모드 토글 -->
      <div class="absolute top-0 right-0 p-2 no-drag">
        <button
          @click="toggleDark()"
          class="h-9 w-9 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <Icon
            :icon="isDark ? 'heroicons:sun-20-solid' : 'heroicons:moon-20-solid'"
            class="h-5 w-5 text-neutral-500 dark:text-neutral-400"
          />
        </button>
      </div>
    </header>

    <!-- 사이드바 -->
    <aside
      class="flex flex-col transition-[width] duration-300 max-h-screen"
      :class="isOpen ? 'w-64' : 'w-0'"
    >
      <div class="flex-none h-12 w-full"></div>
      <AppSidebar v-if="isOpen" />
    </aside>

    <!-- 메인 콘텐츠 -->
    <main
      class="flex flex-1 flex-col min-w-0 transition-all duration-300 overflow-hidden bg-white dark:bg-neutral-900"
    >
      <div class="h-12 flex-none w-full"></div>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.drag-region {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}
</style>
