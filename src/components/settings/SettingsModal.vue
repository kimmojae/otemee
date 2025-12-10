<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSettingsStore } from '@/stores/settings'
import { Icon } from '@iconify/vue'

const settingsStore = useSettingsStore()
const { isOpen, activeTab } = storeToRefs(settingsStore)

const tabs = [
  { id: 'general', label: 'General', icon: 'heroicons:cog-6-tooth' },
  { id: 'api-keys', label: 'API Keys', icon: 'heroicons:key' },
  { id: 'about', label: 'About', icon: 'heroicons:information-circle' },
] as const
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-[900px]! w-[900px] h-[85vh] p-0 gap-0 flex flex-col">
      <DialogHeader class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
        <DialogTitle class="text-base font-medium">Settings</DialogTitle>
      </DialogHeader>

      <div class="flex flex-1 min-h-0">
        <!-- 사이드바 -->
        <nav class="w-52 border-r border-neutral-200 dark:border-neutral-700 p-3 shrink-0">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left mb-1"
            :class="
              activeTab === tab.id
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            "
            @click="activeTab = tab.id"
          >
            <Icon :icon="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </nav>

        <!-- 콘텐츠 -->
        <div class="flex-1 overflow-y-auto p-6">
          <GeneralSettings v-if="activeTab === 'general'" />
          <ApiKeysSettings v-else-if="activeTab === 'api-keys'" />
          <AboutSettings v-else-if="activeTab === 'about'" />
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
