<script setup lang="ts">
import CodeBlock from '@/components/chat/CodeBlock.vue'
import { StreamMarkdown } from 'streamdown-vue'

interface Props {
  content: string
  isStreaming?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isStreaming: false,
})

const components = {
  pre: CodeBlock,
}

const shikiTheme = {
  light: 'github-light',
  dark: 'github-dark',
}
</script>

<template>
  <StreamMarkdown
    :content="content"
    :parseIncompleteMarkdown="isStreaming"
    :components="components"
    :shikiTheme="shikiTheme"
    :codeBlockShowLineNumbers="true"
    :allowedImagePrefixes="['https://', 'http://']"
    :allowedLinkPrefixes="['https://', 'http://', 'mailto:', '#']"
    class="prose dark:prose-invert w-full max-w-full overflow-x-hidden"
  />
</template>
