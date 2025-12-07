# Ollama 스타일 Autoscroll 구현 과정

## 목표
채팅 앱에서 새 메시지를 입력하면 이전 메시지들이 위로 스크롤되고, 새 메시지가 화면 상단에 보이도록 하기 (Ollama와 동일한 동작)

## 문제 발생

### 초기 증상
- 새 메시지를 입력해도 스크롤이 전혀 작동하지 않음
- 이전 메시지가 위로 올라가지 않고 그대로 남아있음
- 두 번째 메시지가 첫 번째 메시지 아래에 그냥 추가됨

## 삽질 과정

### 1차 시도: 메시지 중복 문제로 오해 ❌

**문제 진단:** 메시지가 중복되는 것처럼 보임
**시도한 해결책:**
- `watch`를 deep에서 length로 변경
- `isUpdatingSpacerHeight` 가드 추가
- v-for의 key를 `${message.createdAt}-${idx}`에서 `message.id`로 변경

**결과:** 실패. 중복이 아니라 스크롤 문제였음!

### 2차 시도: React vs Vue 차이 분석 ❌

**문제 진단:** React의 useRef와 Vue의 ref 차이 때문이라고 생각
**시도한 해결책:**
- `pendingScrollToUserMessage`와 `hasSubmittedMessage`를 ref()에서 plain variable로 변경
- `onUpdated` 사용 시도 → composable에서 작동 안함
- `watch`로 다시 변경

**결과:** 부분적으로 맞았지만 근본 원인은 아니었음

### 3차 시도: Spacer 위치 변경 시도 ❌

**문제 진단:** Spacer 위치가 잘못됐을 수도?
**시도한 것들:**
- Spacer를 메시지 위(TOP)에 배치 → 메시지가 안 보임
- Spacer를 메시지 아래(BOTTOM)로 이동 → 메시지가 아래로 붙음
- 다시 위로 이동 → 스크롤 안됨

**결과:** 혼란만 가중됨

### 4차 시도: scrollTop 값 변경 실험 ❌

**시도한 값들:**
- `scrollTop = 0` → 이미 0인 상태에서 0으로 가니 아무 일도 안 일어남
- `scrollTop = spacerHeight.value` → Spacer가 위에 있어서 작동 안함
- `scrollTop = messageOffsetTop - paddingTop` → 메시지가 화면 밖으로 사라짐

**결과:** 모두 실패

## 핵심 발견! 🎯

### Ollama 원본 코드 재분석
Ollama의 MessageList.tsx를 다시 확인한 결과:

```tsx
// Ollama MessageList.tsx Line 165
{/* Dynamic spacer to allow scrolling the last message to the top of the container */}
<div style={{ height: `${spacerHeight}px` }} aria-hidden="true" />
```

**Spacer가 메시지 리스트의 BOTTOM에 있었음!**

### 문제의 원인

#### 잘못된 구현:
```vue
<!-- Spacer가 TOP에 있음 -->
<div :style="{ height: `${spacerHeight}px` }" />
<div v-for="message in messages">...</div>
```

**왜 안되는가?**
- Spacer가 위에 있으면 메시지를 **아래로 밀어냄**
- `scrollTop = 0`이면 Spacer만 보이고 메시지는 안 보임
- 스크롤해도 의미 없는 공간만 스크롤됨

#### 올바른 구현:
```vue
<!-- 메시지가 먼저 -->
<div v-for="message in messages">...</div>
<!-- Spacer가 BOTTOM에 -->
<div :style="{ height: `${spacerHeight}px` }" />
```

**왜 되는가?**
- Spacer가 아래에 있으면 **스크롤 가능한 공간**을 만듦
- 전체 scrollHeight = 메시지 높이 + spacer 높이
- `scrollTop`을 조절해서 원하는 메시지를 상단에 위치시킬 수 있음

### 작동 원리 (Spacer가 BOTTOM에 있을 때)

```
[스크롤 컨테이너] scrollHeight = 1090px
  [메시지 1] 72px ← offsetTop = 0 (상대적)
  [메시지 2] 104px ← offsetTop = 72
  [Spacer] 970px ← 스크롤 가능 공간!
[끝]

containerHeight = 1042px
maxScroll = scrollHeight - containerHeight = 1090 - 1042 = 48px
```

**첫 메시지 입력:**
- spacerHeight = containerHeight - messageHeight = 1042 - 72 = 970px
- scrollTop = 0 (첫 메시지는 항상 최상단)
- 결과: 메시지가 화면 최상단에 보임

**두 번째 메시지 입력:**
- spacerHeight = containerHeight - AI응답높이 - 새메시지높이 = 1042 - 104 - 72 = 866px
- 메시지2의 relativePosition = 72px (메시지1 높이)
- scrollTop = 72px
- 결과: 메시지2가 상단에 오고, 메시지1은 위로 72px 스크롤되어 안 보임

## 추가 문제: offsetTop vs relativePosition

### 발견된 문제
```javascript
// 로그 출력
messageOffsetTop: 52  // ??? 왜 52px?
paddingTop: 0
targetPosition: 52 - 0 = 52
maxScroll: 48
finalPosition: Math.min(52, 48) = 48  // 클램핑됨!
```

**문제:** 메시지가 약간 위로 잘림

### 원인 분석

`offsetTop`은 **offsetParent 기준**으로 계산됨:
```
[Layout] ← 52px 헤더
  [Scroll Container] ← offsetParent
    [Message List]
      [Message] ← offsetTop = 52 (Layout 헤더 때문!)
```

### 해결책: 상대 위치 계산

```typescript
// Message List 엘리먼트 기준으로 상대 위치 계산
const messageListElement = container.querySelector('[data-role="message-list"]')
const messageListTop = messageListElement.offsetTop
const messageOffsetTop = targetElement.offsetTop
const relativePosition = messageOffsetTop - messageListTop

// 첫 메시지는 무조건 0
if (messageIndex === 0) {
  targetPosition = 0
} else {
  targetPosition = relativePosition
}
```

**이렇게 하면:**
- 첫 메시지: scrollTop = 0 (화면 최상단)
- 두 번째 메시지: scrollTop = 72 (첫 메시지 높이만큼 스크롤)
- 클램핑 문제 해결!

## 최종 해결책

### 1. MessageList.vue - Spacer를 BOTTOM으로 이동

```vue
<template>
  <div data-role="message-list">
    <!-- 메시지 먼저 -->
    <div v-for="(message, idx) in messages" :key="message.id" :data-message-index="idx">
      <ChatMessage :message="message" />
    </div>

    <!-- 로딩 dots -->
    <div v-if="showLoadingDots">...</div>

    <!-- Spacer는 맨 마지막! -->
    <div :style="{ height: `${spacerHeight}px` }" aria-hidden="true" />
  </div>
</template>
```

### 2. useMessageAutoscroll.ts - 올바른 스크롤 계산

```typescript
const scrollToMessage = (messageIndex: number) => {
  // Message List 기준 상대 위치 계산
  const messageListElement = container.querySelector('[data-role="message-list"]')
  const relativePosition = messageOffsetTop - messageListElement.offsetTop

  let targetPosition: number

  if (messageIndex === 0) {
    // 첫 메시지는 항상 최상단
    targetPosition = 0
  } else if (isLarge) {
    // 큰 메시지는 하단에
    targetPosition = scrollHeight - containerHeight
  } else {
    // 일반 메시지는 상대 위치 사용
    targetPosition = relativePosition
  }

  // 안전하게 클램핑
  const maxScroll = scrollHeight - containerHeight
  const finalPosition = Math.min(Math.max(0, targetPosition), maxScroll)

  container.scrollTo({ top: finalPosition, behavior: 'smooth' })
}
```

### 3. 타이밍 - 이중 requestAnimationFrame

```typescript
watch(() => messages.value.length, () => {
  if (pendingScrollToUserMessage) {
    requestAnimationFrame(() => {
      updateSpacerHeight()  // 1단계: Spacer 높이 설정
      requestAnimationFrame(() => {
        scrollToMessage(targetUserIndex)  // 2단계: DOM 반영 후 스크롤
        pendingScrollToUserMessage = false
      })
    })
  }
}, { flush: 'post' })
```

**왜 이중 RAF?**
1. 첫 번째 RAF: `spacerHeight` 상태 업데이트
2. 브라우저가 DOM에 spacer 높이 반영
3. 두 번째 RAF: 반영된 scrollHeight로 정확한 스크롤

## 핵심 교훈

### 1. Spacer 위치가 모든 것을 결정한다
- TOP: 메시지를 아래로 밀어냄 → 스크롤 불가능
- BOTTOM: 스크롤 가능 공간 생성 → 스크롤 가능

### 2. offsetTop은 offsetParent 기준
- 절대 위치가 아니라 상대 위치
- 레이아웃 구조에 따라 예상치 못한 값이 나올 수 있음
- 명확한 기준점(message-list)에서 상대 위치 계산 필요

### 3. 디버그 로그의 중요성
```typescript
console.log('[scrollToMessage] Debug info:', {
  messageOffsetTop,    // 52 ← 이상한 값 발견!
  relativePosition,    // 0 ← 올바른 값
  targetPosition,
  finalPosition
})
```
이 로그가 없었으면 문제를 찾지 못했을 것

### 4. 작은 차이가 큰 영향
- `scrollTop = 52` vs `scrollTop = 48` (4px 차이)
- 메시지가 잘리는 것과 안 잘리는 것의 차이
- 클램핑 때문에 의도와 다른 결과 발생

## 최종 동작 흐름

1. 사용자가 메시지 입력
2. `handleNewUserMessage()` 호출 → `pendingScrollToUserMessage = true`
3. messages 배열에 새 메시지 추가
4. `watch(() => messages.value.length)` 트리거
5. **첫 번째 RAF**: `updateSpacerHeight()` 호출
   - containerHeight = 1042px
   - messageHeight = 72px
   - spacerHeight = 1042 - 72 = 970px 계산
   - spacerHeight.value 업데이트
6. **두 번째 RAF**: DOM에 spacer 반영 후
   - scrollHeight = 72 + 970 = 1042px
   - `scrollToMessage(0)` 호출
   - messageIndex === 0 이므로 targetPosition = 0
   - scrollTop = 0으로 설정
   - 결과: 메시지가 화면 최상단에 보임
7. AI 응답 추가되면 spacer 높이 재계산
8. 두 번째 메시지 입력 시:
   - spacerHeight = 1042 - 104 - 72 = 866px
   - relativePosition = 72px (첫 메시지 높이)
   - scrollTop = 72px로 설정
   - 결과: 첫 메시지가 위로 스크롤되고 두 번째 메시지가 상단에 보임

## 참고: Ollama와의 차이점

### Ollama (React)
```typescript
targetPosition = targetElement.offsetTop - paddingTop
```
- Ollama는 컨테이너에 paddingTop이 있음
- offsetTop이 정확하게 계산됨

### 우리 (Vue)
```typescript
// 첫 메시지 특별 처리
if (messageIndex === 0) {
  targetPosition = 0
} else {
  targetPosition = relativePosition
}
```
- 레이아웃 구조 차이로 offsetTop이 부정확
- 상대 위치 계산으로 우회
- 첫 메시지는 무조건 0으로 설정

## 결론

**문제의 핵심:** Spacer의 위치와 offsetTop 계산 방식
**해결의 핵심:** Spacer를 BOTTOM으로 이동 + 상대 위치 계산 + 첫 메시지 특별 처리

긴 삽질이었지만, DOM 구조와 스크롤 메커니즘에 대한 깊은 이해를 얻을 수 있었습니다! 🎉
