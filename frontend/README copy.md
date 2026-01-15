# Development Environment Setup (Troubleshooting)

이 프로젝트에서 VS Code 상 TypeScript/React 파일에 오류 표시(빨간 물결)가 발생할 경우, 아래 순서로 환경을 점검 및 설정합니다.

---

## 1. Node.js 설치

* Node.js **LTS 버전** 설치
  [https://nodejs.org](https://nodejs.org)
* 설치 후 버전 확인

```bash
node -v
npm -v
```

---

## 2. 프로젝트 의존성 설치

프로젝트 루트(`package.json`이 있는 위치)에서 실행합니다.

```bash
npm install
```

> `npm install`은 `package.json`에 정의된 모든 의존성을 설치합니다.

---

## 3. TypeScript 설치 확인

`typescript`가 `devDependencies`에 없는 경우 아래 명령을 실행합니다.

```bash
npm i -D typescript
```

설치 확인:

```bash
npm ls typescript
```

---

## 4. VS Code TypeScript 기능 활성화

VS Code에서 TypeScript 관련 명령이 보이지 않거나 파일 전체에 오류가 표시될 경우, 내장 확장 기능이 비활성화되어 있을 수 있습니다.

### 설정 방법

1. `Ctrl + Shift + X` (확장 탭 열기)
2. `@builtin typescript` 검색
3. **TypeScript and JavaScript Language Features**
4. 상태를 **Enable**로 변경
5. VS Code 재시작 또는 `Developer: Reload Window`

---

## 5. React Router 설치

라우팅 사용을 위해 `react-router-dom`을 설치합니다.

```bash
npm i react-router-dom
```

---

## 6. 개발 서버 실행

```bash
npm run dev
```

---

## 정상 상태 기준

* `npm run dev` 정상 실행
* `.ts / .tsx` 파일에 과도한 오류 표시 없음
* VS Code에서 TypeScript 자동완성 및 타입 체크 정상 동작

---