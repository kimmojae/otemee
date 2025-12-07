# Window Drag 사용법

## 설정 완료

`electron/main.js`와 `electron/preload.js`에 윈도우 드래그/더블클릭 기능이 추가되었습니다.

## Vue 컴포넌트에서 사용하기

### 1. 드래그 가능한 영역 만들기

CSS를 사용하여 드래그 가능한 영역을 지정합니다:

```vue
<template>
  <div class="window-drag-area">
    <!-- 이 영역을 드래그하면 윈도우가 이동합니다 -->
    <h1>My App</h1>
  </div>
</template>

<style>
.window-drag-area {
  -webkit-app-region: drag;
  /* 트래픽 라이트를 위한 여백 고려 */
  padding-left: 80px;
}

/* 드래그 영역 안의 버튼/클릭 가능한 요소는 no-drag 처리 */
.window-drag-area button {
  -webkit-app-region: no-drag;
}
</style>
```

### 2. 더블클릭으로 최대화/복원

```vue
<template>
  <div
    class="window-drag-area"
    @dblclick="handleDoubleClick"
  >
    <!-- 더블클릭하면 최대화/복원 -->
  </div>
</template>

<script setup lang="ts">
function handleDoubleClick() {
  if (window.electronAPI?.doubleClick) {
    window.electronAPI.doubleClick()
  }
}
</script>

<style>
.window-drag-area {
  -webkit-app-region: drag;
}
</style>
```

## 레이아웃 예시

Ollama 스타일의 레이아웃을 만들 때:

```vue
<template>
  <div class="app-container">
    <!-- 드래그 가능한 헤더 영역 -->
    <header
      class="app-header"
      @dblclick="handleDoubleClick"
    >
      <div class="title">My App</div>
      <!-- 버튼들은 클릭 가능해야 하므로 no-drag -->
      <button class="header-button">New</button>
    </header>

    <!-- 메인 콘텐츠 -->
    <div class="app-content">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
function handleDoubleClick() {
  if (window.electronAPI?.doubleClick) {
    window.electronAPI.doubleClick()
  }
}
</script>

<style>
.app-header {
  -webkit-app-region: drag;
  height: 52px;
  padding-left: 80px; /* 트래픽 라이트 공간 */
  display: flex;
  align-items: center;
}

.header-button {
  -webkit-app-region: no-drag;
}

.app-content {
  -webkit-app-region: no-drag;
}
</style>
```

## 주의사항

1. `-webkit-app-region: drag` 영역 안의 모든 요소는 기본적으로 드래그 가능
2. 버튼, 입력 필드 등 상호작용이 필요한 요소는 `-webkit-app-region: no-drag` 추가
3. 트래픽 라이트 위치(`trafficLightPosition: { x: 20, y: 20 }`)를 고려하여 레이아웃 구성
4. 더블클릭 핸들러는 선택사항 (원하지 않으면 추가하지 않아도 됨)
