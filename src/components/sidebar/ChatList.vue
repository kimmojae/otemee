<script setup lang="ts">
import type { ChatGroup } from '@/types/chat'
import ChatListItem from './ChatListItem.vue'

interface Props {
  groups: ChatGroup[]
  activeChatId: string | null
}

defineProps<Props>()

const emit = defineEmits<{
  selectChat: [id: string]
}>()
</script>

<template>
  <div class="flex-1 overflow-y-auto py-2">
    <div v-for="group in groups" :key="group.label" class="mb-4">
      <h3 class="px-4 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-500">
        {{ group.label }}
      </h3>
      <div class="mt-1 space-y-0.5">
        <ChatListItem
          v-for="chat in group.chats"
          :key="chat.id"
          :chat="chat"
          :is-active="chat.id === activeChatId"
          @click="emit('selectChat', chat.id)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 커스텀 스크롤바 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--border) / 0.8);
}
</style>
