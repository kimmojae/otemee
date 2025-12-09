<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { StreamMarkdown } from 'streamdown-vue'

interface Props {
  content: string
  isStreaming?: boolean
}

withDefaults(defineProps<Props>(), {
  isStreaming: false,
})

const isDark = useDark()
</script>

<template>
  <StreamMarkdown
    :content="content"
    :parseIncompleteMarkdown="isStreaming"
    :code-block-hide-download="true"
    :shiki-theme="isDark ? 'github-dark' : 'github-light'"
    :allowedImagePrefixes="['https://', 'http://']"
    :allowedLinkPrefixes="['https://', 'http://', 'mailto:', '#']"
    class="streamdown-vue prose dark:prose-invert w-full max-w-full overflow-x-hidden"
  />
</template>

<style scoped>
.streamdown-vue {
  /* Light mode - ChatGPT/Claude 스타일 (검정 텍스트) */
  --sd-primary: #171717;
  --sd-primary-variant: #262626;
  --sd-on-surface: #171717;
  --sd-surface-container: #e5e7eb;
  --sd-border-color: #d4d4d8;
  --sd-font-family-base: inherit;
  --sd-font-family-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
}

/* Dark mode (흰색 텍스트) */
.dark .streamdown-vue {
  --sd-primary: #fafafa;
  --sd-primary-variant: #f5f5f5;
  --sd-on-surface: #fafafa;
  --sd-surface-container: #3f3f46;
  --sd-border-color: #52525b;
}

/* ===== ChatGPT 스타일 코드블록 ===== */

/* 코드블록 컨테이너 - Light mode */
.streamdown-vue :deep([data-streamdown='code-block']) {
  border-radius: 8px;
  overflow: hidden;
  border: none;
  background: #f4f4f4;
  margin: 1rem 0;
}

/* 헤더 - Light mode */
.streamdown-vue :deep([data-streamdown='code-block-header']) {
  background: #e8e8e8;
  border-bottom: none;
  padding: 8px 16px;
  font-size: 12px;
}

/* 언어 배지 - Light mode */
.streamdown-vue :deep([data-streamdown='code-lang']) {
  color: #6b6b6b;
  background: transparent;
  text-transform: lowercase;
  font-weight: 500;
  letter-spacing: 0;
}

/* 복사 버튼 - Light mode */
.streamdown-vue :deep([data-streamdown='copy-button']) {
  color: #6b6b6b;
  background: transparent;
  border: none;
  gap: 6px;
  padding: 4px 8px;
  font-size: 12px;
  transition: color 0.2s;
}

.streamdown-vue :deep([data-streamdown='copy-button']:hover) {
  color: #171717;
  background: transparent;
}

/* 코드 본문 - Light mode */
.streamdown-vue :deep([data-streamdown='code-body']) {
  background: #f4f4f4;
  padding: 16px;
}

.streamdown-vue :deep([data-streamdown='code-body'] pre) {
  background: transparent;
  margin: 0;
  padding: 0;
}

/* ===== Dark mode 코드블록 ===== */
.dark .streamdown-vue :deep([data-streamdown='code-block']) {
  background: #1e1e1e;
}

.dark .streamdown-vue :deep([data-streamdown='code-block-header']) {
  background: #2f2f2f;
}

.dark .streamdown-vue :deep([data-streamdown='code-lang']) {
  color: #b4b4b4;
}

.dark .streamdown-vue :deep([data-streamdown='copy-button']) {
  color: #b4b4b4;
}

.dark .streamdown-vue :deep([data-streamdown='copy-button']:hover) {
  color: #ffffff;
}

.dark .streamdown-vue :deep([data-streamdown='code-body']) {
  background: #1e1e1e;
}

/* 인라인 코드 스타일 */
.streamdown-vue :deep([data-streamdown='inline-code']) {
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  background: var(--sd-surface-container);
}

/* ===== 리스트 스타일 ===== */
.streamdown-vue :deep([data-streamdown='ul']) {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.streamdown-vue :deep([data-streamdown='ul'] [data-streamdown='ul']) {
  list-style-type: circle;
}

.streamdown-vue :deep([data-streamdown='ol']) {
  list-style-type: decimal;
  padding-left: 1.5rem;
}

.streamdown-vue :deep([data-streamdown='ol'] [data-streamdown='ol']) {
  list-style-type: lower-alpha;
}

.streamdown-vue :deep([data-streamdown='li']) {
  margin: 0.25rem 0;
}

/* 체크박스가 있는 리스트는 마커 제거 */
.streamdown-vue :deep([data-streamdown='li']:has(input[type='checkbox'])) {
  list-style: none;
  margin-left: -1.5rem;
}

/* ===== 체크박스 스타일 ===== */
.streamdown-vue :deep(input[type='checkbox']) {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  vertical-align: middle;
  margin-right: 8px;
  position: relative;
  transition: all 0.15s ease;
}

.streamdown-vue :deep(input[type='checkbox']:checked) {
  background: #10b981;
  border-color: #10b981;
}

.streamdown-vue :deep(input[type='checkbox']:checked::after) {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.streamdown-vue :deep(input[type='checkbox']:not(:checked):hover) {
  border-color: #9ca3af;
}

/* Dark mode 체크박스 */
.dark .streamdown-vue :deep(input[type='checkbox']) {
  border-color: #52525b;
}

.dark .streamdown-vue :deep(input[type='checkbox']:not(:checked):hover) {
  border-color: #71717a;
}
</style>
