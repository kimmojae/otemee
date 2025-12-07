<script setup lang="ts">
import { Check, Copy, Download } from 'lucide-vue-next'
import { computed, ref } from 'vue'

interface Props {
  children?: any
  className?: string
}

const props = defineProps<Props>()
const copied = ref(false)

// children에서 언어와 코드 추출
const extractCodeInfo = (children: any) => {
  try {
    // streamdown-vue는 pre > code 구조로 전달
    if (!children) {
      return { language: '', code: '' }
    }

    // children이 배열인 경우
    if (Array.isArray(children)) {
      const codeElement = children.find((child: any) => child?.type === 'code')
      if (codeElement) {
        const className = codeElement.props?.className || ''
        const language = className.replace('language-', '')
        const code = codeElement.children?.[0] || ''
        return { language, code }
      }
    }

    // children이 객체인 경우
    if (typeof children === 'object' && children.type === 'code') {
      const className = children.props?.className || ''
      const language = className.replace('language-', '')
      const code = children.children?.[0] || ''
      return { language, code }
    }

    // 기본값
    return { language: '', code: String(children) }
  } catch (error) {
    console.error('Code extraction error:', error)
    return { language: '', code: '' }
  }
}

const { language, code } = computed(() => extractCodeInfo(props.children)).value

const copyCode = async () => {
  if (!code) return

  try {
    await navigator.clipboard.writeText(code)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (error) {
    console.error('Copy failed:', error)
  }
}

const downloadCode = () => {
  if (!code) return

  try {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${language || 'txt'}`
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
  }
}
</script>

<template>
  <div class="code-block-container" data-streamdown="code-block">
    <div class="code-block-header">
      <span class="language-badge" data-streamdown="code-lang">
        {{ language || 'plaintext' }}
      </span>
      <div class="code-actions">
        <button
          type="button"
          @click="copyCode"
          class="action-button"
          data-streamdown="copy-button"
          aria-label="코드 복사"
        >
          <Check v-if="copied" :size="16" />
          <Copy v-else :size="16" />
        </button>
        <button
          type="button"
          @click="downloadCode"
          class="action-button"
          data-streamdown="download-button"
          aria-label="코드 다운로드"
        >
          <Download :size="16" />
        </button>
      </div>
    </div>
    <slot />
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

.code-block-container {
  @apply relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900;
}

.code-block-header {
  @apply flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-800;
}

.language-badge {
  @apply text-xs font-mono text-neutral-600 dark:text-neutral-400 uppercase;
}

.code-actions {
  @apply flex gap-2;
}

.action-button {
  @apply p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors;
}
</style>
