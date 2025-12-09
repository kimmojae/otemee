<route lang="yaml">
name: home
meta:
  title: Home
  layout: default
</route>

<script setup lang="ts">
import ChatPrompt from '@/components/chat/ChatPrompt.vue'
import MessageList from '@/components/chat/MessageList.vue'
import { useMessageAutoscroll } from '@/composables/useMessageAutoscroll'
import type { Message } from '@/types/chat'

const messages = ref<Message[]>([])
const isLoading = ref(false)
const isStreaming = ref(false)
let loadingTimer: number | undefined

const { containerRef, spacerHeight, handleNewUserMessage } = useMessageAutoscroll({
  messages,
  isStreaming,
})

const handleMessageSubmit = (content: string) => {
  // 사용자 메시지 추가
  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content,
    createdAt: new Date().toISOString(),
  }
  messages.value.push(userMessage)

  // 자동 스크롤 트리거
  handleNewUserMessage()

  // 스트리밍 시작
  isStreaming.value = true

  // 750ms 후에 로딩 표시
  loadingTimer = window.setTimeout(() => {
    isLoading.value = true
  }, 750)

  // Mock AI 응답 (1초 후)
  setTimeout(() => {
    if (loadingTimer) {
      clearTimeout(loadingTimer)
    }
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `# 마크다운 렌더링 테스트

안녕하세요! **streamdown-vue**를 사용한 마크다운 렌더링이 적용되었습니다.

## 기능 테스트

### 1. 텍스트 스타일
일반 텍스트, **볼드**, *이탤릭*, ***볼드 이탤릭***, ~~취소선~~, \`인라인 코드\`

### 2. 코드 블록

**TypeScript:**
\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`
}

console.log(greet('World'))
\`\`\`

**Python:**
\`\`\`python
def fibonacci(n: int) -> list[int]:
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib[:n]

print(fibonacci(10))
\`\`\`

**Bash:**
\`\`\`bash
#!/bin/bash
echo "Hello, World!"
for i in {1..5}; do
  echo "Count: $i"
done
\`\`\`

### 3. 리스트

**순서 없는 리스트:**
- 첫 번째 항목
- 두 번째 항목
  - 중첩된 항목
  - 또 다른 중첩 항목
- 세 번째 항목

**순서 있는 리스트:**
1. 첫 번째 단계
2. 두 번째 단계
3. 세 번째 단계
   1. 세부 단계 A
   2. 세부 단계 B

**체크박스 리스트:**
- [x] 완료된 작업
- [x] 또 다른 완료된 작업
- [ ] 아직 안 한 작업
- [ ] 나중에 할 작업

### 4. 인용문

> 이것은 인용문입니다.
> 여러 줄로 작성할 수 있습니다.
>
> > 중첩된 인용문도 가능합니다.

### 5. 링크와 이미지

[GitHub](https://github.com)에서 더 많은 정보를 확인하세요.

![Placeholder Image](https://placehold.co/600x400)

### 6. 테이블

| 기능 | 상태 | 비고 |
|:-----|:----:|-----:|
| 코드 하이라이팅 | ✅ | Shiki 사용 |
| 수학 수식 | ✅ | KaTeX 사용 |
| 다이어그램 | ✅ | Mermaid 지원 |
| 스트리밍 | ✅ | 실시간 렌더링 |

### 7. 수학 수식

인라인 수식: $e^{i\\pi} + 1 = 0$, $\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$

블록 수식:
$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

$$
f(x) = \\begin{cases}
  x^2 & \\text{if } x \\geq 0 \\\\
  -x^2 & \\text{if } x < 0
\\end{cases}
$$

### 8. 수평선

위 내용

---

아래 내용

---

무엇을 도와드릴까요?`,
      createdAt: new Date().toISOString(),
    }
    messages.value.push(aiMessage)

    // 스트리밍 및 로딩 표시 종료
    isStreaming.value = false
    isLoading.value = false
  }, 1000)
}

const handleCancel = () => {
  // AI 응답 중단
  isStreaming.value = false
  isLoading.value = false

  // 타이머 정리
  if (loadingTimer) {
    clearTimeout(loadingTimer)
  }
}
</script>

<template>
  <div class="flex flex-col flex-1 overflow-hidden">
    <!-- 메시지가 없을 때: 중앙 정렬 -->
    <div v-if="messages.length === 0" class="flex flex-col flex-1 justify-center">
      <ChatPrompt
        :is-new-chat="true"
        :is-streaming="isStreaming"
        @submit="handleMessageSubmit"
        @cancel="handleCancel"
      />
    </div>

    <!-- 메시지가 있을 때: 리스트 + 하단 고정 입력창 -->
    <template v-else>
      <div ref="containerRef" class="flex-1 overflow-y-auto min-h-0">
        <MessageList
          :messages="messages"
          :show-loading-dots="isLoading"
          :spacer-height="spacerHeight"
        />
      </div>

      <div class="shrink-0">
        <ChatPrompt
          :is-new-chat="false"
          :is-streaming="isStreaming"
          @submit="handleMessageSubmit"
          @cancel="handleCancel"
        />
      </div>
    </template>
  </div>
</template>
