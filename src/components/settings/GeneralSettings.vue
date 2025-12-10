<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useColorMode } from '@vueuse/core'

const colorMode = useColorMode()

type ThemeOption = 'light' | 'dark' | 'auto'
const themeOptions: { value: ThemeOption; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: 'heroicons:sun-20-solid' },
  { value: 'dark', label: 'Dark', icon: 'heroicons:moon-20-solid' },
  { value: 'auto', label: 'System', icon: 'heroicons:computer-desktop-20-solid' },
]

// store는 저장된 설정값 (auto 포함), value는 실제 적용된 모드 (light/dark만)
const currentSetting = computed(() => colorMode.store.value)

const setTheme = (theme: ThemeOption) => {
  colorMode.store.value = theme
}
</script>

<template>
  <div class="space-y-6">
    <!-- Appearance -->
    <section>
      <h3 class="text-sm font-medium text-neutral-900 dark:text-white mb-1">Appearance</h3>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
        Customize the look and feel of the app
      </p>

      <div class="space-y-4">
        <!-- Theme -->
        <div>
          <div class="text-sm text-neutral-700 dark:text-neutral-300 mb-3">Theme</div>
          <div class="flex gap-2">
            <button
              v-for="option in themeOptions"
              :key="option.value"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors"
              :class="
                currentSetting === option.value
                  ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              "
              @click="setTheme(option.value)"
            >
              <Icon :icon="option.icon" class="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
              <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {{ option.label }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
