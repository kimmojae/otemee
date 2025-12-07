<script setup lang="ts">
import { Icon } from '@iconify/vue'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

interface MenuItem {
  label: string
  icon?: string
  onClick: () => void
  disabled?: boolean
}

interface Props {
  items: MenuItem[]
}

defineProps<Props>()
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem
        v-for="(item, index) in items"
        :key="index"
        :disabled="item.disabled"
        @click="item.onClick"
      >
        <Icon v-if="item.icon" :icon="item.icon" class="mr-2 h-4 w-4" />
        {{ item.label }}
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
