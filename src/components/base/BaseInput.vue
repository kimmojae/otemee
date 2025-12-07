<script setup lang="ts">
import { Input } from '@/components/ui/input'

interface Props {
  placeholder?: string
  type?: string
  disabled?: boolean
  error?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
})

const model = defineModel<string>()
</script>

<template>
  <div class="w-full">
    <Input
      v-model="model"
      :placeholder="placeholder"
      :type="type"
      :disabled="disabled"
      :class="{ 'border-destructive': error }"
    />
    <p v-if="error" class="mt-1 text-sm text-destructive">
      {{ error }}
    </p>
  </div>
</template>
