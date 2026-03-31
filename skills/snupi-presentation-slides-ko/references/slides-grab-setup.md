# slides-grab setup (KO)

`slides-grab` CLI 또는 설치된 `slides-grab` 스킬이 없을 때 이 문서를 사용합니다.

## 표준 npm 설치
```bash
npm install slides-grab
npx playwright install chromium
npx skills add ./node_modules/slides-grab -g -a codex --yes --copy
npx slides-grab --help
```

그 다음 Codex를 재시작해서 설치된 `slides-grab` 스킬이 로드되도록 합니다.

## 메모
- 각 덱은 `decks/<deck-name>/` 아래에 둡니다.
- `slides-grab edit`, `build-viewer`, `validate`, `pdf`, `convert`는 모두 `slide-*.html`이 있는 기존 덱이 필요합니다.
- 이 SNUPI 스킬은 검증, viewer 빌드, editor 실행까지만 담당합니다. export는 이후 단계입니다.
