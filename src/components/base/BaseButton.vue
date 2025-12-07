<script setup lang="ts">
import { Button, type ButtonVariants } from '@/components/ui/button'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
})

// 프로젝트 variant → shadcn variant 매핑
const shadcnVariant = computed<ButtonVariants['variant']>(() => {
  switch (props.variant) {
    case 'primary':
      return 'default'
    case 'secondary':
      return 'outline'
    case 'danger':
      return 'destructive'
    case 'ghost':
      return 'ghost'
    default:
      return 'default'
  }
})

// 프로젝트 size → shadcn size 매핑
const shadcnSize = computed<ButtonVariants['size']>(() => {
  switch (props.size) {
    case 'sm':
      return 'sm'
    case 'md':
      return 'default'
    case 'lg':
      return 'lg'
    default:
      return 'default'
  }
})
</script>

<template>
  <Button :variant="shadcnVariant" :size="shadcnSize">
    <slot />
  </Button>
</template>
