# Tailwind CSS v4 사용 가이드

이 프로젝트는 **Tailwind CSS v4**를 사용합니다. v4는 v3와 비교해 많은 변경사항이 있습니다.

## 📚 목차

- [주요 변경사항](#주요-변경사항)
- [프로젝트 구조](#프로젝트-구조)
- [테마 커스터마이징](#테마-커스터마이징)
- [다크모드](#다크모드)
- [유틸리티 클래스 확장](#유틸리티-클래스-확장)
- [컴포넌트 스타일링 패턴](#컴포넌트-스타일링-패턴)
- [@apply 사용 가이드](#apply-사용-가이드)
- [추천 라이브러리](#추천-라이브러리)

## 주요 변경사항

### 1. Import 방식 변경

```css
/* ❌ v3 방식 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ v4 방식 */
@import 'tailwindcss';
```

### 2. 레이어 순서 명시

v4에서는 CSS Cascade Layers를 사용하여 우선순위를 명확하게 합니다:

```css
@layer theme, base, components, utilities;
```

### 3. 테마 설정

JavaScript 설정 파일 대신 CSS 변수를 사용합니다:

```css
/* ❌ v3: tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6'
      }
    }
  }
}

/* ✅ v4: CSS 파일 */
@theme {
  --color-primary: #3b82f6;
}
```

### 4. Variant 정의

```css
/* v4: Custom variant */
@custom-variant dark (&:is(.dark *));
```

## 프로젝트 구조

### src/assets/main.css

프로젝트의 모든 Tailwind 설정이 한 파일에 있습니다:

```css
@import 'pretendard/dist/web/static/pretendard.css';
@import 'tailwindcss';

/* 레이어 순서 정의 */
@layer theme, base, components, utilities;

/* 커스텀 variant */
@custom-variant dark (&:is(.dark *));

/* CSS 변수 정의 (:root) */
:root {
  --white: #ffffff;
  --background: var(--white);
  /* ... */
}

/* 다크모드 변수 */
.dark {
  --background: var(--black);
  /* ... */
}

/* Tailwind 테마 변수 */
@theme inline {
  --color-background: var(--background);
  --font-pretendard: Pretendard, sans-serif;
  /* ... */
}

/* Base 스타일 */
@layer base {
  /* 전역 리셋, body 스타일 등 */
}
```

## 테마 커스터마이징

### 색상 추가

```css
:root {
  --my-color: #ff6b6b;
}

@theme inline {
  --color-danger: var(--my-color);
}
```

사용:
```html
<div class="bg-danger text-white">Danger!</div>
```

### 폰트 추가

```css
@theme {
  --font-mono: 'Fira Code', monospace;
}
```

사용:
```html
<code class="font-mono">const hello = 'world'</code>
```

### 커스텀 spacing

```css
@theme {
  --spacing-128: 32rem;
}
```

사용:
```html
<div class="p-128">Very large padding</div>
```

### Breakpoint 추가

```css
@theme {
  --breakpoint-3xl: 120rem;
}
```

사용:
```html
<div class="grid grid-cols-2 3xl:grid-cols-6">
  <!-- 120rem 이상에서 6컬럼 -->
</div>
```

## 다크모드

### 다크모드 토글

```vue
<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <button @click="toggleDark()">
    {{ isDark ? '🌙' : '☀️' }}
  </button>
</template>
```

### 다크모드 스타일링

```html
<!-- HTML에서 -->
<div class="bg-white dark:bg-black text-gray-900 dark:text-white">
  다크모드 대응 컨텐츠
</div>
```

```css
/* CSS에서 */
@layer base {
  .my-element {
    background: var(--color-background);

    @variant dark {
      background: var(--color-background-mute);
    }
  }
}
```

### 새로운 다크모드 색상 추가

```css
:root {
  --blue-light: #3b82f6;
}

.dark {
  --blue-light: #60a5fa;
}

@theme inline {
  --color-blue-light: var(--blue-light);
}
```

## 유틸리티 클래스 확장

### @utility 사용

```css
@utility tab-4 {
  tab-size: 4;
}
```

사용:
```html
<pre class="tab-4">
  code with 4-space tabs
</pre>
```

### Variant 지원하는 커스텀 유틸리티

```css
@utility text-balance {
  text-wrap: balance;
}
```

사용:
```html
<h1 class="text-balance hover:text-wrap-stable">
  Balanced heading text
</h1>
```

## 컴포넌트 스타일링 패턴

### 패턴 1: Utility Classes (권장)

```vue
<template>
  <button
    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    Click me
  </button>
</template>
```

**장점:**
- 빠른 개발
- 변경 사항 예측 가능
- 번들 크기 증가 없음

### 패턴 2: Composables + Computed

```vue
<script setup lang="ts">
const buttonClass = computed(() => ({
  'px-4 py-2 rounded': true,
  'bg-blue-500 hover:bg-blue-600': !props.disabled,
  'bg-gray-300 cursor-not-allowed': props.disabled,
}))
</script>

<template>
  <button :class="buttonClass">
    <slot />
  </button>
</template>
```

### 패턴 3: @layer components (서드파티 스타일 오버라이드용)

```css
@layer components {
  .prose {
    h1 { @apply text-4xl font-bold mt-8 mb-4; }
    h2 { @apply text-3xl font-semibold mt-6 mb-3; }
    p { @apply text-base leading-7 mb-4; }
  }
}
```

사용:
```html
<article class="prose" v-html="content" />
```

## @apply 사용 가이드

### ✅ 사용해도 되는 경우

#### 1. Base 스타일
```css
@layer base {
  body {
    @apply min-h-screen bg-background text-foreground;
  }
}
```

#### 2. 서드파티 라이브러리 오버라이드
```css
@layer components {
  .datepicker__header {
    @apply bg-blue-500 text-white rounded-t-lg;
  }
}
```

#### 3. CMS 콘텐츠 스타일링
```css
@layer components {
  .cms-content {
    h1 { @apply text-4xl font-bold; }
    p { @apply text-base my-4; }
  }
}
```

### ❌ 사용하면 안 되는 경우

#### 1. 일반 컴포넌트 (HTML 수정 가능)
```css
/* ❌ 나쁜 예 */
.button {
  @apply px-4 py-2 bg-blue-500;
}

/* ✅ 좋은 예: HTML에서 직접 */
<button class="px-4 py-2 bg-blue-500">
```

#### 2. Vue SFC `<style>` 블록
```vue
<!-- ❌ 작동 안 함 -->
<style scoped>
.my-button {
  @apply px-4 py-2;  /* 에러 발생 가능 */
}
</style>

<!-- ✅ CSS 변수 직접 사용 -->
<style scoped>
.my-button {
  padding: 0.5rem 1rem;
  background: var(--color-blue-500);
}
</style>
```

### 대안: CSS 변수 직접 사용

```css
/* @apply 대신 */
.my-element {
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-foreground);
}
```

**장점:**
- 빌드 성능 향상 (Tailwind 처리 불필요)
- Vue SFC에서도 작동
- 더 명확한 코드

## 추천 라이브러리

재사용 가능한 컴포넌트를 만들 때 유용한 라이브러리:

### clsx
조건부 클래스 조합

```bash
pnpm add clsx
```

```ts
import clsx from 'clsx'

const buttonClass = clsx(
  'px-4 py-2',
  isActive && 'bg-blue-500',
  !isActive && 'bg-gray-200'
)
```

### tailwind-merge
충돌하는 Tailwind 클래스 병합

```bash
pnpm add tailwind-merge
```

```ts
import { twMerge } from 'tailwind-merge'

// bg-red-500이 제거되고 bg-blue-500만 남음
twMerge('bg-red-500 px-4', 'bg-blue-500')
// => 'px-4 bg-blue-500'
```

### class-variance-authority (CVA)
타입 안전한 variant 시스템

```bash
pnpm add class-variance-authority
```

```ts
import { cva, type VariantProps } from 'class-variance-authority'

const button = cva({
  base: 'font-medium rounded',
  variants: {
    intent: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-200 text-gray-900',
    },
    size: {
      sm: 'text-sm px-3 py-1.5',
      lg: 'text-lg px-6 py-3',
    }
  },
  defaultVariants: {
    intent: 'primary',
    size: 'sm',
  }
})

type ButtonProps = VariantProps<typeof button>

button({ intent: 'primary', size: 'lg' })
// => 'font-medium rounded bg-blue-500 text-white text-lg px-6 py-3'
```

### 세 가지 함께 사용 (권장)

```ts
// utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```ts
// components/button.ts
import { cva } from 'class-variance-authority'
import { cn } from '@/utils/cn'

export const buttonVariants = cva({
  base: 'inline-flex items-center justify-center rounded-md',
  variants: {
    variant: {
      default: 'bg-primary text-white',
      ghost: 'hover:bg-accent',
    },
    size: {
      default: 'h-10 px-4',
      sm: 'h-9 px-3',
    }
  }
})
```

```vue
<!-- Button.vue -->
<script setup lang="ts">
import { buttonVariants } from './button'
import { cn } from '@/utils/cn'

interface Props {
  variant?: 'default' | 'ghost'
  size?: 'default' | 'sm'
  class?: string
}

const props = defineProps<Props>()

const classes = computed(() => cn(
  buttonVariants({
    variant: props.variant,
    size: props.size
  }),
  props.class
))
</script>

<template>
  <button :class="classes">
    <slot />
  </button>
</template>
```

## 참고 자료

- [Tailwind CSS v4 공식 문서](https://tailwindcss.com/)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [clsx Documentation](https://github.com/lukeed/clsx)
- [tailwind-merge Documentation](https://github.com/dcastil/tailwind-merge)
- [CVA Documentation](https://cva.style/docs)

## 문제 해결

### Tailwind IntelliSense가 작동하지 않는 경우

VS Code에서 `settings.json`에 추가:

```json
{
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### CSS 변수 자동완성

Tailwind IntelliSense는 `@theme inline`으로 정의한 변수를 자동으로 인식합니다.

### 빌드 시 CSS 파일이 너무 큰 경우

사용하지 않는 클래스가 포함되지 않았는지 확인:
- Vite는 자동으로 사용된 클래스만 포함합니다
- `node_modules` 내부의 파일도 스캔 대상에 포함될 수 있습니다

---

더 궁금한 사항은 [Tailwind CSS Discord](https://tailwindcss.com/discord)에서 질문하세요!
