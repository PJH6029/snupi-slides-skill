# SNUPI 스타일 가이드 (KO)

설치된 `slides-grab` 디자인 워크플로우 위에 이 규칙을 덧씌우되, `assets/template-html/`에 번들된 HTML 템플릿을 canonical visual source로 사용합니다.

## 프레임과 타이포
- 기본 프레임은 `slides-grab`의 `720pt x 405pt` (16:9)를 유지합니다.
- 폰트는 Pretendard 또는 `slides-grab` 기본 타이포 스택을 사용합니다.
- 제목은 보통 `35pt` 이상을 유지합니다.
- 본문은 보통 `25pt` 이상을 유지합니다.
- 이 크기에서 답이 안 나오면 글자를 줄이지 말고 내용을 줄이세요.

## 템플릿 fidelity 규칙
- 새로운 레이아웃을 만들기 전에 번들된 HTML 템플릿에서 시작하세요.
- 사용자가 명시적으로 바꾸라고 하지 않는 한 파란 상하단 bar, footer logo/date/page 리듬, serif 중심 제목 처리를 유지하세요.
- title, list, figure, equation, meeting-log 슬라이드는 템플릿의 slide archetype을 재사용하세요.
- 레포의 PPTX/PDF는 레거시 visual reference일 뿐이며 1차 기준은 아닙니다.

## SNUPI 발표 규칙
- 가능하면 슬라이드당 하나의 큰 figure, table, equation만 둡니다.
- 시각 자료는 말로 설명하고, 조밀한 문단으로 대체하지 마세요.
- 긴 bullet list와 텍스트 벽을 피하세요.
- 목적이 분명하지 않다면 여러 이미지를 한 장에 몰아넣지 마세요.
- 수식은 큰 수식 한두 개를 보여주고, 유도 과정 블록은 피하세요.
- meeting-log 슬라이드는 실제 필요할 때만 넣으세요.

## 시각 방향
- 장식적인 business deck보다 밝고 깔끔한 academic layout을 우선합니다.
- 카드나 장식보다 여백, 정렬, 크기 대비를 먼저 사용하세요.
- 표지와 section divider는 포스터처럼 한 메시지에 집중하세요.
- 포인트 컬러는 절제해서 쓰고, 차트와 figure는 발표 거리에서도 읽혀야 합니다.
- 나중에 PPTX export 가능성을 생각해 CSS gradient는 피하세요.

## 내용 리듬
- 먼저 왜 이 논문이나 업데이트가 중요한지 보여주세요.
- 그 다음 method, evidence, critique, takeaway 순으로 전개하세요.
- 각 슬라이드는 몇 초 안에 훑어볼 수 있어야 합니다.
- 확신이 없으면 텍스트를 줄이고 가장 중요한 figure를 더 크게 쓰세요.
