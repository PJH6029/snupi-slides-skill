# Template HTML 워크플로우 (KO)

슬라이드 HTML을 만들 때 이 문서를 따릅니다. `assets/template-html/` 아래의 번들 파일이 1차 시각적 source of truth입니다.

## 먼저 읽을 파일
- `assets/template-html/index.html`
- `assets/template-html/styles.css`
- `assets/template-html/deck.js`는 viewer 동작 참고용이며, 콘텐츠 규칙의 1차 기준은 아닙니다

## 템플릿 사용법
- `index.html` 안의 각 `<section class="slide ...">` 블록을 master slide archetype으로 취급하세요.
- 각 `slides-grab` `slide-XX.html` 파일은 가장 가까운 archetype을 재현해야 하며, 새로운 레이아웃을 임의로 만들지 마세요.
- 아래 전역 문법을 유지하세요.
  - 상단과 하단의 accent bar,
  - 흰 바탕,
  - footer logo/date/page 구조,
  - serif 중심 제목 처리,
  - 넓은 여백과 중앙 시각 강조.

## 슬라이드 archetype map
- `slide-1`: title slide
- `slide-2`, `slide-3`, `slide-8`, `slide-10`: list 또는 text slide
- `slide-4`: single dominant figure slide
- `slide-5`: anti-pattern gallery 또는 정말 필요한 경우에만 multi-image comparison
- `slide-6`: equation 또는 diagram + 짧은 보조 설명
- `slide-7`: what to avoid 예시 슬라이드. 발표에 대비 구도가 꼭 필요할 때만 사용
- `slide-9`: meeting-log title slide

## 실제 drafting 규칙
- spacing, footer 위치, accent color, title treatment는 템플릿 HTML을 기준으로 맞추세요.
- multi-slide deck 전체를 한 파일에 복사하지 말고, `slides-grab`에 맞는 단일 슬라이드 파일로 구조를 옮기세요.
- 확신이 없으면 먼저 HTML 템플릿에 맞추고, 그 다음 레거시 PPTX/PDF를 참고하세요.
- 사용자가 템플릿에서 벗어나는 디자인을 원하면 어떤 규칙을 왜 깨는지 명확히 밝히세요.
