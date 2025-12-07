# 컴포넌트 템플릿 가이드

Vue 3 프로젝트에서 새 컴포넌트를 만들 때 사용할 표준 템플릿 구조입니다.

> **버전 정보**: 이 가이드는 Vue 3.3+ 기능을 포함합니다. `defineModel()`은 Vue 3.4+에서 사용 가능합니다.

## 기본 템플릿

```vue
<script setup lang="ts">
// Props, Emits, Composables
</script>

<template>
  <div class="component-name">
    <!-- Component content -->
  </div>
</template>

<style scoped>
.component-name {
  /* Component styles */
}
</style>
```

## 컴포넌트 타입별 템플릿

### 1. 기본 컴포넌트

단순히 UI만 표시하는 컴포넌트:

```vue
<script setup lang="ts">
// 로직이 없으면 비워둬도 됨
</script>

<template>
  <div class="card">
    <slot />
  </div>
</template>

<style scoped>
.card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
```

### 2. Props를 받는 컴포넌트

```vue
<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  disabled: false,
})
</script>

<template>
  <div class="card" :class="{ disabled: props.disabled }">
    <h2>{{ props.title }}</h2>
    <p v-if="props.subtitle">{{ props.subtitle }}</p>
    <slot />
  </div>
</template>

<style scoped>
.card {
  padding: 1rem;
  border-radius: 8px;
}

.card.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
```

### 3. Events를 발생시키는 컴포넌트

일반 이벤트 (v-model이 아닌 경우):

```vue
<script setup lang="ts">
interface Props {
  title: string
}

// 방식 1: Interface 사용 (기존)
interface Emits {
  (e: 'click'): void
  (e: 'delete', id: string): void
  (e: 'submit', data: FormData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 방식 2: 객체 타입 사용 (Vue 3.3+, 더 간결)
// const emit = defineEmits<{
//   click: []
//   delete: [id: string]
//   submit: [data: FormData]
// }>()

const handleClick = () => {
  emit('click')
}

const handleDelete = () => {
  emit('delete', props.title)
}
</script>

<template>
  <div class="card">
    <h3>{{ props.title }}</h3>
    <button @click="handleClick">Click</button>
    <button @click="handleDelete">Delete</button>
  </div>
</template>

<style scoped>
.card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.card button {
  margin-right: 0.5rem;
}
</style>
```

### 4. Composable을 사용하는 컴포넌트

```vue
<script setup lang="ts">
interface Props {
  userId: string
}

const props = defineProps<Props>()

// Auto-imported composables
const { data: user, isLoading, error } = useFetch(`/api/users/${props.userId}`)
</script>

<template>
  <div class="user-card">
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <h3>{{ user?.name }}</h3>
      <p>{{ user?.email }}</p>
    </div>
  </div>
</template>

<style scoped>
.user-card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
```

### 5. Slot을 활용하는 컴포넌트

```vue
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
})

// Vue 3.3+: 타입 안전한 슬롯 정의
const slots = defineSlots<{
  default?: () => any
  icon?: () => any
}>()
</script>

<template>
  <button
    class="btn"
    :class="[`btn-${props.variant}`, `btn-${props.size}`]"
  >
    <slot name="icon" />
    <span class="btn-text">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-md {
  padding: 0.5rem 1rem;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}
</style>
```

## 컴포넌트 명명 규칙

### 파일명

- **PascalCase** 사용: `UserCard.vue`, `AppButton.vue`
- **접두사** 사용 권장:
  - `App` - 앱 전역 컴포넌트 (AppHeader, AppFooter)
  - `Base` - 기본 UI 컴포넌트 (BaseButton, BaseInput)
  - `The` - 단일 인스턴스 컴포넌트 (TheNavbar, TheSidebar)

### 폴더 구조

```
src/components/
├── common/              # 공통 컴포넌트
│   ├── AppButton.vue
│   ├── AppCard.vue
│   └── AppModal.vue
├── layout/              # 레이아웃 컴포넌트
│   ├── AppHeader.vue
│   ├── AppFooter.vue
│   └── AppSidebar.vue
├── forms/               # 폼 관련 컴포넌트
│   ├── InputField.vue
│   ├── SelectField.vue
│   └── CheckboxField.vue
└── features/            # 기능별 컴포넌트
    ├── user/
    │   ├── UserCard.vue
    │   └── UserList.vue
    └── post/
        ├── PostCard.vue
        └── PostList.vue
```

## TypeScript 타입 정의

### Props 타입

```typescript
// 기본 타입
interface Props {
  title: string
  count: number
  isActive: boolean
  items: string[]
  user: User
}

// 선택적 프로퍼티
interface Props {
  title: string
  subtitle?: string  // 선택적
}

// Union 타입
interface Props {
  variant: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

// 객체 타입
interface User {
  id: string
  name: string
  email: string
}

interface Props {
  user: User
}
```

### Emits 타입

```typescript
// 방식 1: Interface 사용 (기존)
interface Emits {
  (e: 'click'): void
  (e: 'update:modelValue', value: string): void
  (e: 'submit', data: FormData): void
  (e: 'change', id: string, value: number): void
}

const emit = defineEmits<Emits>()

// 방식 2: 객체 타입 사용 (Vue 3.3+, 더 간결)
const emit = defineEmits<{
  click: []
  'update:modelValue': [value: string]
  submit: [data: FormData]
  change: [id: string, value: number]
}>()
```

## 체크리스트

새 컴포넌트를 만들 때 확인:

- [ ] PascalCase 파일명 사용
- [ ] `<script setup lang="ts">` 사용
- [ ] Props는 interface로 타입 정의
- [ ] Emits는 interface 또는 객체 타입으로 정의
- [ ] v-model이 필요하면 `defineModel()` 사용 고려 (Vue 3.4+)
- [ ] Slots를 사용하면 `defineSlots()` 사용 고려 (Vue 3.3+)
- [ ] `<style scoped>` 사용
- [ ] Auto-import 활용 (불필요한 import 제거)
- [ ] 컴포넌트명은 명확하고 설명적으로
- [ ] 적절한 폴더에 배치

## 피해야 할 패턴

### ❌ 타입 없는 Props

```vue
<!-- Bad -->
<script setup lang="ts">
const props = defineProps(['title', 'count'])
</script>

<!-- Good -->
<script setup lang="ts">
interface Props {
  title: string
  count: number
}
const props = defineProps<Props>()
</script>
```

### ❌ Global 스타일

```vue
<!-- Bad -->
<style>
.button { /* Global */ }
</style>

<!-- Good -->
<style scoped>
.button { /* Scoped */ }
</style>
```

## Tailwind 4 사용 가이드

### `<style scoped>`에서 Tailwind 유틸리티 사용

Vue SFC의 `<style scoped>` 블록에서 `@apply`를 사용하려면 `@reference` 디렉티브가 필요합니다.

```vue
<template>
  <div class="card">
    <h2 class="text-xl font-bold">{{ title }}</h2>
  </div>
</template>

<style scoped>
@reference '../assets/main.css';

.card {
  @apply p-4 rounded-lg bg-white shadow-md;
}

.card:hover {
  @apply shadow-lg;
}
</style>
```

**왜 `@reference`가 필요한가?**
- `<style scoped>`는 별도로 번들링되므로 Tailwind 테마 변수에 접근할 수 없음
- `@reference`는 CSS를 복제하지 않고 테마 정의만 참조함

### Tailwind 클래스 우선 사용 권장

가능하면 `<template>`에서 직접 Tailwind 클래스를 사용하고, `<style scoped>`는 복잡한 경우에만 사용:

```vue
<!-- Good - Tailwind 클래스 직접 사용 -->
<template>
  <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click me
  </button>
</template>

<!-- OK - 복잡한 경우 @apply 사용 -->
<template>
  <button class="custom-button">Click me</button>
</template>

<style scoped>
@reference '../assets/main.css';

.custom-button {
  @apply px-4 py-2 bg-blue-500 text-white rounded;
}

.custom-button:hover {
  @apply bg-blue-600;
}

/* ::before, ::after 같은 의사 요소는 @apply 사용 */
.custom-button::before {
  content: '';
  @apply absolute -inset-1 rounded-lg opacity-0;
}
</style>
```

### ❌ 너무 많은 Props

```vue
<!-- Bad - 너무 많은 props -->
<script setup lang="ts">
interface Props {
  prop1: string
  prop2: string
  prop3: string
  // ... 10개 이상
}
</script>

<!-- Good - 객체로 묶기 -->
<script setup lang="ts">
interface Config {
  prop1: string
  prop2: string
  prop3: string
}

interface Props {
  config: Config
}
</script>
```

## v-model 패턴

### 방식 1: defineModel 사용 (Vue 3.4+, 권장)

**단일 v-model**:

```vue
<script setup lang="ts">
const model = defineModel<string>()
</script>

<template>
  <input v-model="model" />
</template>
```

**여러 v-model**:

```vue
<script setup lang="ts">
const firstName = defineModel<string>('firstName')
const lastName = defineModel<string>('lastName')
</script>

<template>
  <div>
    <input v-model="firstName" placeholder="First Name" />
    <input v-model="lastName" placeholder="Last Name" />
  </div>
</template>
```

**기본값이 있는 v-model**:

```vue
<script setup lang="ts">
const count = defineModel<number>({ default: 0 })
const title = defineModel<string>('title', { default: 'Untitled' })
</script>

<template>
  <div>
    <input v-model.number="count" type="number" />
    <input v-model="title" />
  </div>
</template>
```

### 방식 2: Props + Emits 사용 (기존, 호환성)

**단일 v-model**:

```vue
<script setup lang="ts">
interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <input
    :value="props.modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
```

**여러 v-model**:

```vue
<script setup lang="ts">
interface Props {
  firstName: string
  lastName: string
}

interface Emits {
  (e: 'update:firstName', value: string): void
  (e: 'update:lastName', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div>
    <input
      :value="props.firstName"
      @input="emit('update:firstName', ($event.target as HTMLInputElement).value)"
    />
    <input
      :value="props.lastName"
      @input="emit('update:lastName', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
```

> **참고**: Vue 3.4+에서는 `defineModel()`을 사용하는 것이 훨씬 간단합니다. 기존 방식은 호환성이 필요한 경우에만 사용하세요.

## 참고 자료

- [Vue 3 Script Setup](https://vuejs.org/api/sfc-script-setup.html)
- [Vue 3 TypeScript](https://vuejs.org/guide/typescript/overview.html)
- [Vue 3 Component Props](https://vuejs.org/guide/components/props.html)
- [Vue 3 Component Events](https://vuejs.org/guide/components/events.html)
- [Vue Style Guide](https://vuejs.org/style-guide/)
