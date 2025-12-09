<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Chat } from '@/types/chat'

interface Props {
  chat: Chat
  isActive: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  click: []
  rename: []
  delete: []
}>()

const isMenuOpen = ref(false)
</script>

<template>
  <div
    class="group flex items-center gap-2 rounded-lg px-3 py-1.5 mx-2 cursor-pointer transition-colors"
    :class="{
      'bg-neutral-100 dark:bg-neutral-800': isActive || isMenuOpen,
      'hover:bg-neutral-100 dark:hover:bg-neutral-800': !isActive && !isMenuOpen,
    }"
    @click="emit('click')"
  >
    <span class="flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">
      {{ chat.title }}
    </span>

    <!-- 옵션 버튼 (hover 또는 active 시 표시) -->
    <DropdownMenu v-model:open="isMenuOpen">
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="h-6 w-6 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 shrink-0"
          :class="{ 'opacity-100': isActive || isMenuOpen }"
          @click.stop
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" class="w-32 min-w-0 p-1">
        <DropdownMenuItem class="text-xs px-2 py-1.5 cursor-pointer" @click="emit('rename')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="mr-1.5"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
          이름 변경
        </DropdownMenuItem>

        <DropdownMenuSeparator class="my-1" />

        <DropdownMenuItem
          class="text-xs px-2 py-1.5 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          @click="emit('delete')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="mr-1.5"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
