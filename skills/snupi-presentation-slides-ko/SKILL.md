---
name: snupi-presentation-slides-ko
description: 한국어 SNUPI Lab 발표 덱을 위한 research-aware slides-grab 래퍼입니다. Markdown 브리프, 논문 URL 또는 PDF, 인터뷰 중 하나로 입력을 받아 outline 승인, HTML 슬라이드 생성, 검증, viewer 빌드, editor 실행까지 진행하며, 번들된 SNUPI HTML 템플릿을 우선적으로 따를 때 사용합니다.
metadata:
  short-description: 한국어 SNUPI Lab 연구 발표 슬라이드 워크플로우
---

# SNUPI Research Slides (한국어)

문헌 리뷰, 논문 발표, 세미나 업데이트, 연구 미팅용 **한국어 발표 덱**을 `slides-grab` 기반으로 만들 때 이 스킬을 사용합니다.

## 목표
아래 draft-deck 흐름을 끝까지 수행합니다.
1. `slides-grab` CLI와 설치된 `slides-grab` 스킬 사용 가능 여부 확인
2. 사용자 자료를 deck workspace로 정리
3. `presentation-brief.md` 작성
4. `slide-outline.md` 작성 및 승인 받기
5. `slide-XX.html` 생성
6. 검증 및 viewer 빌드
7. `slides-grab` editor 실행

outline 승인을 생략하지 마세요. HTML만 만들고 끝내지 마세요. 이 스킬에서는 export를 하지 마세요.

## 백엔드 전제
이 스킬은 설치된 `slides-grab` 워크플로우 위에 SNUPI 발표 규칙을 덧씌우는 래퍼입니다.

콘텐츠 작업 전에:
1. `slides-grab --help` 또는 `npm exec -- slides-grab --help`로 CLI를 확인합니다.
2. CLI가 없으면 `references/slides-grab-setup.md`를 따릅니다.
3. Codex용 `slides-grab` 스킬이 없으면 설치 후 Codex 재시작을 안내합니다.
4. 설치가 끝나면 반드시 `$slides-grab` 스킬을 명시적으로 호출하고, 계획/디자인/검증/viewer/editor 흐름의 기본 백엔드로 사용합니다.

## 템플릿 source of truth
이 스킬의 1차 시각적 기준은 `assets/template-html/` 아래에 번들된 HTML 템플릿입니다.

슬라이드를 만들기 전에:
1. `assets/template-html/index.html`을 읽습니다.
2. `assets/template-html/styles.css`를 읽습니다.
3. `references/template-html-workflow.md`를 읽고 template deck을 `slides-grab`용 slide file로 어떻게 옮길지 정합니다.

레거시 PPTX/PDF는 HTML 템플릿이 모호할 때만 보조 참고로 사용하세요.

## 입력 우선순위
아래 순서대로 가장 강한 입력원을 사용합니다.
1. 사용자가 준 Markdown 브리프 또는 정리된 노트
2. 사용자가 준 논문 URL 또는 로컬 PDF
3. 부족한 정보를 채우기 위한 구조화 인터뷰

항상 입력을 `decks/<deck-slug>/presentation-brief.md`로 정리한 뒤 outline을 작성하세요.

## Deck workspace 규약
작업 경로는 `decks/<deck-slug>/`를 사용합니다.
- `presentation-brief.md`
- `slide-outline.md`
- `research/`
- `assets/`
- `slide-XX.html`

후속 수정도 같은 workspace 안에서 이어가세요.

## 워크플로우
1. `slides-grab` 사용 가능 여부를 확인하고 `$slides-grab`를 호출합니다.
2. `decks/<deck-slug>/`를 생성하거나 재사용합니다.
3. `presentation-brief.md`를 만듭니다.
   - Markdown 브리프가 있으면 구조를 최대한 보존하고 빈칸만 보완합니다.
   - 논문 URL 또는 PDF가 있으면 `references/paper-intake-and-figure-workflow.md`를 따릅니다.
   - 핵심 정보가 여전히 비어 있으면 `references/interview-checklist.md`의 질문을 사용합니다.
4. `references/deck-recipes.md`에서 가장 가까운 기본 덱 구조를 고릅니다.
5. 슬라이드 순서, 핵심 메시지, figure/table/equation 슬롯이 포함된 `slide-outline.md`를 작성합니다.
6. outline을 짧게 보여주고 명시적 승인을 받습니다.
7. 승인 후 설치된 `slides-grab` 워크플로우를 사용해 `slide-XX.html`을 생성합니다.
8. 디자인할 때 `references/snupi-style-guide.md`를 적용합니다.
   - `slides-grab`의 기본 16:9 프레임 유지
   - 번들된 HTML 템플릿의 footer, bar, title treatment, layout grammar를 재현
   - 슬라이드마다 하나의 큰 시각적 중심 사용
   - 텍스트는 발표용으로 짧게 유지
9. 생성하는 각 슬라이드는 `assets/template-html/index.html`의 가장 가까운 master pattern을 기반으로 하세요. 사용자가 원하지 않는 한 새로운 시각 언어를 만들어내지 마세요.
10. 논문 기반 덱에서는 가능한 경우 실제 figure/table을 `./assets/`에 저장해 사용합니다. 추출 결과가 약하면 `data-image-placeholder`와 source-aware caption을 사용합니다.
11. `slides-grab validate --slides-dir <path>`를 실행합니다.
12. 검증이 통과할 때까지 HTML/CSS를 수정합니다.
13. `slides-grab build-viewer --slides-dir <path>`를 실행합니다.
14. viewer 경로를 사용자에게 알려줍니다.
15. draft deck이 준비되면 `slides-grab edit --slides-dir <path>`를 실행합니다.

## 규칙
- 기본 출력 언어는 한국어입니다. 사용자가 명시적으로 원하면 다른 언어를 사용할 수 있습니다.
- `slides-grab`의 기본 `720pt x 405pt` 프레임을 유지하세요.
- 번들된 HTML 템플릿을 느슨한 스타일 가이드가 아니라 canonical layout source로 취급하세요.
- 레거시 PPTX/PDF는 HTML 템플릿이 답을 주지 못할 때만 보조 참고로 사용하세요.
- 최종 HTML에는 원격 이미지 URL을 남기지 말고 `./assets/`의 로컬 자산을 우선하세요.
- figure/table/equation의 내용은 원문에 충실해야 합니다. 확신이 낮으면 캡션에서 불확실성을 밝히고 꾸며내지 마세요.
- meeting-log 슬라이드는 실제로 도움이 될 때만 넣으세요.
- 이 스킬은 검증, viewer 빌드, editor 실행에서 종료합니다. PDF/PPTX가 필요하면 `slides-grab-export`로 넘기세요.

## 참고
- `references/slides-grab-setup.md`
- `references/interview-checklist.md`
- `references/paper-intake-and-figure-workflow.md`
- `references/snupi-style-guide.md`
- `references/deck-recipes.md`
- `references/template-html-workflow.md`
