<script setup lang="ts">
import { useChatsStore } from '@/stores/chats'
import { storeToRefs } from 'pinia'
import ChatList from './ChatList.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const router = useRouter()
const chatsStore = useChatsStore()
const { groupedChats, activeChatId } = storeToRefs(chatsStore)

// Rename dialog state
const isRenameDialogOpen = ref(false)
const renamingChatId = ref<string | null>(null)
const newChatTitle = ref('')

// Delete dialog state
const isDeleteDialogOpen = ref(false)
const deletingChatId = ref<string | null>(null)

const handleNewChat = () => {
  // 새 채팅 화면으로 이동
  router.push('/chat/new')
}

const handleSelectChat = (id: string) => {
  // 채팅 페이지로 이동
  router.push(`/chat/${id}`)
}

const handleRenameChat = (id: string) => {
  const chat = chatsStore.chats?.find(c => c.id === id)
  if (chat) {
    renamingChatId.value = id
    newChatTitle.value = chat.title
    isRenameDialogOpen.value = true
  }
}

const confirmRename = async () => {
  if (renamingChatId.value && newChatTitle.value.trim()) {
    await chatsStore.renameChat(renamingChatId.value, newChatTitle.value.trim())
    isRenameDialogOpen.value = false
    renamingChatId.value = null
    newChatTitle.value = ''
  }
}

const handleDeleteChat = (id: string) => {
  deletingChatId.value = id
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (deletingChatId.value) {
    await chatsStore.deleteChat(deletingChatId.value)
    isDeleteDialogOpen.value = false
    deletingChatId.value = null
  }
}
</script>

<template>
  <div class="flex flex-col flex-1 overflow-hidden">
    <!-- New Chat 버튼 -->
    <div class="px-2 pt-3 pb-2">
      <button
        @click="handleNewChat"
        class="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-900 dark:text-neutral-100"
      >
        <svg
          class="h-5 w-5 fill-current shrink-0"
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
        <span class="text-sm font-medium">New Chat</span>
      </button>
    </div>

    <!-- 채팅 목록 -->
    <div class="flex-1 overflow-y-auto">
      <ChatList
        :groups="groupedChats"
        :active-chat-id="activeChatId"
        @select-chat="handleSelectChat"
        @rename-chat="handleRenameChat"
        @delete-chat="handleDeleteChat"
      />
    </div>

    <!-- 브랜딩 -->
    <div class="py-3 text-center text-xs text-neutral-400 dark:text-neutral-600">
      © Otemee
    </div>

    <!-- Rename Dialog -->
    <Dialog v-model:open="isRenameDialogOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>채팅 이름 변경</DialogTitle>
          <DialogDescription>
            새로운 채팅 이름을 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <Input
            v-model="newChatTitle"
            placeholder="채팅 이름"
            @keyup.enter="confirmRename"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isRenameDialogOpen = false">
            취소
          </Button>
          <Button @click="confirmRename">
            변경
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>채팅 삭제</DialogTitle>
          <DialogDescription>
            이 채팅을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="isDeleteDialogOpen = false">
            취소
          </Button>
          <Button variant="destructive" @click="confirmDelete">
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
