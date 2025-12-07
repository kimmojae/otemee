# VSCode Snippets 설정 가이드

VSCode에서 Vue 페이지와 컴포넌트를 빠르게 생성할 수 있는 코드 스니펫 설정 방법입니다.

> **버전 정보**: 이 가이드는 Vue 3.3+ 및 Vue 3.4+ 최신 기능을 포함합니다.
> - `defineModel()`: Vue 3.4+
> - `defineEmits` 객체 타입: Vue 3.3+
> - `defineSlots()`: Vue 3.3+

## 목차

- [페이지 Snippets](#페이지-snippets)
- [컴포넌트 Snippets](#컴포넌트-snippets)

## 설정 방법

### 1. User Snippets 열기

VSCode에서:

1. `Cmd/Ctrl + Shift + P` → 명령 팔레트 열기
2. `Preferences: Configure User Snippets` 검색
3. `vue.json` 선택 (없으면 새로 생성)

### 2. Snippet 코드 복사

아래 코드를 `vue.json` 파일에 붙여넣기:

## 페이지 Snippets

```json
{
  "Vue Page Template": {
    "prefix": "vpage",
    "body": [
      "<route lang=\"yaml\">",
      "meta:",
      "  title: ${1:Page Title}",
      "</route>",
      "",
      "<script setup lang=\"ts\">",
      "$2",
      "</script>",
      "",
      "<template>",
      "  <div class=\"${3:page}-container\">",
      "    $0",
      "  </div>",
      "</template>",
      "",
      "<style scoped>",
      ".${3:page}-container {",
      "  ",
      "}",
      "</style>"
    ],
    "description": "Create a new Vue page with route block"
  },
  "Vue Page with Layout": {
    "prefix": "vpage-layout",
    "body": [
      "<route lang=\"yaml\">",
      "meta:",
      "  title: ${1:Page Title}",
      "  layout: ${2:default}",
      "</route>",
      "",
      "<script setup lang=\"ts\">",
      "$3",
      "</script>",
      "",
      "<template>",
      "  <div class=\"${4:page}-container\">",
      "    $0",
      "  </div>",
      "</template>",
      "",
      "<style scoped>",
      ".${4:page}-container {",
      "  ",
      "}",
      "</style>"
    ],
    "description": "Create a new Vue page with custom layout"
  },
  "Vue Page with Auth": {
    "prefix": "vpage-auth",
    "body": [
      "<route lang=\"yaml\">",
      "meta:",
      "  title: ${1:Page Title}",
      "  requiresAuth: true",
      "  layout: ${2:default}",
      "</route>",
      "",
      "<script setup lang=\"ts\">",
      "$3",
      "</script>",
      "",
      "<template>",
      "  <div class=\"${4:page}-container\">",
      "    $0",
      "  </div>",
      "</template>",
      "",
      "<style scoped>",
      ".${4:page}-container {",
      "  ",
      "}",
      "</style>"
    ],
    "description": "Create an authenticated Vue page"
  },
  "Vue Dynamic Route Page": {
    "prefix": "vpage-dynamic",
    "body": [
      "<route lang=\"yaml\">",
      "meta:",
      "  title: ${1:Page Title}",
      "</route>",
      "",
      "<script setup lang=\"ts\">",
      "const route = useRoute('${2:/path/[id]}')",
      "const ${3:id} = computed(() => route.params.${3:id})",
      "",
      "$0",
      "</script>",
      "",
      "<template>",
      "  <div class=\"${4:page}-container\">",
      "    <h1>{{ ${3:id} }}</h1>",
      "  </div>",
      "</template>",
      "",
      "<style scoped>",
      ".${4:page}-container {",
      "  ",
      "}",
      "</style>"
    ],
    "description": "Create a Vue page with dynamic route"
  }
}
```

## 사용 방법

### 1. 기본 페이지 (`vpage`)

1. `.vue` 파일 생성
2. `vpage` 입력 후 `Tab`
3. 페이지 제목 입력 → `Tab`
4. Script 영역에 로직 작성 → `Tab`
5. 컨테이너 클래스명 지정 → `Tab`
6. 템플릿 내용 작성

**결과:**
```vue
<route lang="yaml">
meta:
  title: About
</route>

<script setup lang="ts">
// 커서가 여기로 이동
</script>

<template>
  <div class="about-container">
    // 최종 커서 위치
  </div>
</template>

<style scoped>
.about-container {

}
</style>
```

### 2. 레이아웃이 있는 페이지 (`vpage-layout`)

1. `vpage-layout` 입력 후 `Tab`
2. 페이지 제목 입력 → `Tab`
3. 레이아웃 선택 (default/auth/admin) → `Tab`
4. 나머지 작성

**사용 예시:**
```vue
<route lang="yaml">
meta:
  title: Login
  layout: auth
</route>
```

### 3. 인증이 필요한 페이지 (`vpage-auth`)

1. `vpage-auth` 입력 후 `Tab`
2. 페이지 제목 입력 → `Tab`
3. 레이아웃 선택 → `Tab`
4. 나머지 작성

**사용 예시:**
```vue
<route lang="yaml">
meta:
  title: Dashboard
  requiresAuth: true
  layout: admin
</route>
```

### 4. 동적 라우트 페이지 (`vpage-dynamic`)

1. `vpage-dynamic` 입력 후 `Tab`
2. 페이지 제목 입력 → `Tab`
3. 라우트 경로 입력 (예: `/users/[id]`) → `Tab`
4. 파라미터 이름 입력 (예: `id`) → `Tab`
5. 나머지 작성

**사용 예시:**
```vue
<route lang="yaml">
meta:
  title: User Profile
</route>

<script setup lang="ts">
const route = useRoute('/users/[id]')
const id = computed(() => route.params.id)

</script>

<template>
  <div class="user-container">
    <h1>{{ id }}</h1>
  </div>
</template>
```

## Tab Stop 순서

각 스니펫의 Tab 이동 순서:

1. `${1:...}` - 페이지 제목
2. `${2:...}` - 레이아웃 또는 Script 영역
3. `${3:...}` - 컨테이너 클래스명 또는 파라미터명
4. `${4:...}` - 추가 옵션
5. `$0` - 최종 커서 위치 (템플릿 내부)

## 팁

### 여러 파일에 동시 적용

1. 여러 `.vue` 파일 생성
2. 각 파일에서 `vpage` 입력
3. Multi-cursor 모드로 동시 편집

### 커스텀 스니펫 추가

필요한 패턴이 있다면 `vue.json`에 추가:

```json
{
  "Your Custom Snippet": {
    "prefix": "vpage-custom",
    "body": [
      "// 여기에 템플릿 작성"
    ],
    "description": "설명"
  }
}
```

## 자주 사용하는 조합

### 간단한 페이지
- `vpage` → 기본 템플릿

### 인증 페이지
- `vpage-layout` → `auth` 레이아웃

### 관리자 페이지
- `vpage-auth` → `admin` 레이아웃

### 상세 페이지
- `vpage-dynamic` → 동적 라우트

---

## 컴포넌트 Snippets

### 기본 컴포넌트 템플릿

```json
{
  "Vue Component": {
    "prefix": "vcomp",
    "body": [
      "<script setup lang=\"ts\">",
      "$1",
      "</script>",
      "",
      "<template>",
      "  <div class=\"${2:component-name}\">",
      "    $0",
      "  </div>",
      "</template>",
      "",
      "<style scoped>",
      ".${2:component-name} {",
      "  ",
      "}",
      "</style>"
    ],
    "description": "Create a basic Vue component"
  },
  "Vue Component with Props": {
    "prefix": "vcomp-props",
    "body": [
      "<script setup lang=\"ts\">",
      "interface Props {",
      "  ${1:propName}: ${2:string}",
      "}",
      "",
      "const props = defineProps<Props>()",
      "$3",
      "</script>",
      "",
      "<template>",
      "  <div class=\"${4:component-name}\">",
      "    {{ props.${1:propName} }}",
      "    $0",
      "  </div>",
      "</template>",
      "",
      "<style scoped>",
      ".${4:component-name} {",
      "  ",
      "}",
      "</style>"
    ],
    "description": "Create a Vue component with typed props"
  },
  "Vue Component with Props & Emits (Vue 3.3+)": {
    "prefix": "vcomp-emit",
    "body": [
      "<script setup lang=\"ts\">",
      "interface Props {",
      "  ${1:propName}: ${2:string}",
      "}",
      "",
      "const props = defineProps<Props>()",
      "",
      "// 방식 1: 객체 타입 (Vue 3.3+, 더 간결)",
      "const emit = defineEmits<{",
      "  ${3:eventName}: []",
      "  ${4:anotherEvent}: [data: ${5:string}]",
      "}>()",
      "",
      "// 방식 2: Interface (기존)",
      "// interface Emits {",
      "//   (e: '${3:eventName}'): void",
      "//   (e: '${4:anotherEvent}', data: ${5:string}): void",
      "// }",
      "// const emit = defineEmits<Emits>()",
      "",
      "const handle${3/(.*)/${1:/capitalize}/} = () => {",
      "  emit('${3:eventName}')",
      "}",
      "$6",
      "</script>",
      "",
      "<template>",
      "  <div class=\"${7:component-name}\" @click=\"handle${3/(.*)/${1:/capitalize}/}\">",
      "    $0",
      "  </div>",
      "</template>",
      "",
      "<style scoped>",
      ".${7:component-name} {",
      "  ",
      "}",
      "</style>"
    ],
    "description": "Create a Vue component with props and emits (Vue 3.3+ syntax)"
  },
  "Vue Component with v-model (Vue 3.4+)": {
    "prefix": "vcomp-model",
    "body": [
      "<script setup lang=\"ts\">",
      "const ${1:model} = defineModel<${2:string}>()",
      "$3",
      "</script>",
      "",
      "<template>",
      "  <div class=\"${4:component-name}\">",
      "    <input v-model=\"${1:model}\" />",
      "    $0",
      "  </div>",
      "</template>",
      "",
      "<style scoped>",
      ".${4:component-name} {",
      "  ",
      "}",
      "</style>"
    ],
    "description": "Create a Vue component with v-model using defineModel (Vue 3.4+)"
  },
  "Vue Component with multiple v-models": {
    "prefix": "vcomp-models",
    "body": [
      "<script setup lang=\"ts\">",
      "const ${1:firstName} = defineModel<string>('${1:firstName}')",
      "const ${2:lastName} = defineModel<string>('${2:lastName}')",
      "$3",
      "</script>",
      "",
      "<template>",
      "  <div class=\"${4:component-name}\">",
      "    <input v-model=\"${1:firstName}\" placeholder=\"First Name\" />",
      "    <input v-model=\"${2:lastName}\" placeholder=\"Last Name\" />",
      "    $0",
      "  </div>",
      "</template>",
      "",
      "<style scoped>",
      ".${4:component-name} {",
      "  ",
      "}",
      "</style>"
    ],
    "description": "Create a Vue component with multiple v-models (Vue 3.4+)"
  },
  "Vue Component with Slots": {
    "prefix": "vcomp-slot",
    "body": [
      "<script setup lang=\"ts\">",
      "interface Props {",
      "  ${1:propName}?: ${2:string}",
      "}",
      "",
      "const props = withDefaults(defineProps<Props>(), {",
      "  ${1:propName}: ${3:''}",
      "})",
      "$4",
      "</script>",
      "",
      "<template>",
      "  <div class=\"${5:component-name}\">",
      "    <slot name=\"${6:header}\" />",
      "    <slot />",
      "    <slot name=\"${7:footer}\" />",
      "    $0",
      "  </div>",
      "</template>",
      "",
      "<style scoped>",
      ".${5:component-name} {",
      "  ",
      "}",
      "</style>"
    ],
    "description": "Create a Vue component with named slots"
  },
  "Vue Component with Typed Slots (Vue 3.3+)": {
    "prefix": "vcomp-slots",
    "body": [
      "<script setup lang=\"ts\">",
      "interface Props {",
      "  ${1:propName}?: ${2:string}",
      "}",
      "",
      "const props = withDefaults(defineProps<Props>(), {",
      "  ${1:propName}: ${3:''}",
      "})",
      "",
      "// Vue 3.3+: 타입 안전한 슬롯",
      "const slots = defineSlots<{",
      "  default?: () => any",
      "  ${4:header}?: (props: { ${5:title}: string }) => any",
      "  ${6:footer}?: () => any",
      "}>()",
      "$7",
      "</script>",
      "",
      "<template>",
      "  <div class=\"${8:component-name}\">",
      "    <slot name=\"${4:header}\" :${5:title}=\"props.${1:propName}\" />",
      "    <slot />",
      "    <slot name=\"${6:footer}\" />",
      "    $0",
      "  </div>",
      "</template>",
      "",
      "<style scoped>",
      ".${8:component-name} {",
      "  ",
      "}",
      "</style>"
    ],
    "description": "Create a Vue component with typed slots (Vue 3.3+)"
  }
}
```

## 컴포넌트 Snippet 사용법

### 1. 기본 컴포넌트 (`vcomp`)

1. `.vue` 파일 생성
2. `vcomp` 입력 후 `Tab`
3. Script 영역 작성 → `Tab`
4. 클래스명 입력 → `Tab`
5. 템플릿 내용 작성

**결과:**
```vue
<script setup lang="ts">
// 커서
</script>

<template>
  <div class="user-card">
    // 최종 커서
  </div>
</template>

<style scoped>
.user-card {

}
</style>
```

### 2. Props가 있는 컴포넌트 (`vcomp-props`)

1. `vcomp-props` 입력 후 `Tab`
2. Prop 이름 입력 → `Tab`
3. Prop 타입 입력 → `Tab`
4. 추가 로직 작성 → `Tab`
5. 클래스명 입력

**결과:**
```vue
<script setup lang="ts">
interface Props {
  title: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="card">
    {{ props.title }}
  </div>
</template>
```

### 3. Events가 있는 컴포넌트 (`vcomp-emit`)

**Vue 3.3+ 방식** - 객체 타입으로 더 간결하게:

```vue
<script setup lang="ts">
interface Props {
  count: number
}

const props = defineProps<Props>()

// 방식 1: 객체 타입 (Vue 3.3+, 더 간결)
const emit = defineEmits<{
  increment: []
  decrement: []
  update: [value: number]
}>()

// 방식 2: Interface (기존)
// interface Emits {
//   (e: 'increment'): void
//   (e: 'decrement'): void
//   (e: 'update', value: number): void
// }
// const emit = defineEmits<Emits>()

const handleIncrement = () => {
  emit('increment')
}
</script>

<template>
  <div class="counter" @click="handleIncrement">
    {{ props.count }}
  </div>
</template>
```

### 4. v-model 컴포넌트 (`vcomp-model`)

**Vue 3.4+ 방식** - `defineModel()` 사용:

```vue
<script setup lang="ts">
const model = defineModel<string>()
</script>

<template>
  <div class="input-field">
    <input v-model="model" />
  </div>
</template>
```

**여러 v-model** (`vcomp-models`):

```vue
<script setup lang="ts">
const firstName = defineModel<string>('firstName')
const lastName = defineModel<string>('lastName')
</script>

<template>
  <div class="form-fields">
    <input v-model="firstName" placeholder="First Name" />
    <input v-model="lastName" placeholder="Last Name" />
  </div>
</template>
```

### 5. Slot이 있는 컴포넌트 (`vcomp-slot`)

Named slots를 활용한 레이아웃 컴포넌트:

```vue
<script setup lang="ts">
interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: ''
})
</script>

<template>
  <div class="card">
    <slot name="header" />
    <slot />
    <slot name="footer" />
  </div>
</template>
```

### 6. 타입 안전한 Slot 컴포넌트 (`vcomp-slots`)

**Vue 3.3+** - `defineSlots()`로 타입 안전하게:

```vue
<script setup lang="ts">
interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: ''
})

// Vue 3.3+: 타입 안전한 슬롯
const slots = defineSlots<{
  default?: () => any
  header?: (props: { title: string }) => any
  footer?: () => any
}>()
</script>

<template>
  <div class="card">
    <slot name="header" :title="props.title" />
    <slot />
    <slot name="footer" />
  </div>
</template>
```

## 컴포넌트 조합 예시

### UI 컴포넌트
- `vcomp-props` + `vcomp-slots` → Button, Card 등

### 폼 컴포넌트
- `vcomp-model` → Input, Select, Checkbox (Vue 3.4+)
- `vcomp-models` → Multi-field forms (Vue 3.4+)

### 컨테이너 컴포넌트
- `vcomp-slots` → Modal, Drawer, Panel (Vue 3.3+)
- `vcomp-slot` → 기본 레이아웃

### 스마트 컴포넌트
- `vcomp-emit` → 데이터 로딩 및 이벤트 처리 (Vue 3.3+)

## 문제 해결

### Snippet이 작동하지 않을 때

1. VSCode 재시작
2. `vue.json` 파일 문법 오류 확인
3. Volar/Vue 익스텐션 설치 확인

### Tab이 작동하지 않을 때

- `Tab` 대신 `Ctrl/Cmd + Space`로 수동 트리거
- Emmet과 충돌하는 경우 설정 조정 필요

## 참고 자료

- [VSCode Snippets 문서](https://code.visualstudio.com/docs/editor/userdefinedsnippets)
- [Snippet Generator](https://snippet-generator.app/)
