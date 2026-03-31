# 논문 입력 및 figure 추출 워크플로우 (KO)

사용자가 논문 URL, DOI, arXiv 링크, 로컬 PDF를 제공하면 이 문서를 따릅니다.

## Research workspace
`decks/<deck-slug>/research/` 아래에는 후속 수정에 필요한 최소한의 근거를 남깁니다.
- 원본 URL 메모,
- 다운로드하거나 복사한 PDF,
- 추출된 텍스트,
- 사용할 만한 figure/table 이미지

공개 계약은 `research/`까지만 보장하지만, 필요하면 가벼운 하위 파일이나 하위 폴더를 사용해도 됩니다.

## 입력 처리 순서
1. 가능한 경우 각 소스를 로컬 PDF로 정리합니다.
2. PDF를 `decks/<deck-slug>/research/` 아래에 저장하거나 복사합니다.
3. 아래 유틸리티가 있으면 실행합니다.
   - `pdfinfo <paper>.pdf`
   - `pdftotext <paper>.pdf <paper>.txt`
   - `pdfimages -all <paper>.pdf <paper>-img`
4. 제목, 초록, 섹션 헤더, 결과가 많은 부분을 먼저 읽습니다.
5. 슬라이드 스토리에 맞는 시각 자료 후보를 고릅니다.
   - method overview,
   - main result table,
   - ablation chart,
   - qualitative comparison,
   - limitation or failure case

## 자산 선택 규칙
- 캡션과 주변 문맥이 슬라이드 메시지를 분명히 뒷받침할 때만 실제 figure/table을 사용하세요.
- 선택한 자산은 `decks/<deck-slug>/assets/`로 복사하고 `./assets/<file>`로 참조하세요.
- 최종 HTML에는 원격 `http(s)://` 이미지 URL을 남기지 마세요.
- 저화질, 중복, 의미가 불분명한 이미지는 억지로 넣지 마세요.

## Placeholder 대체 규칙
믿을 만한 시각 자료가 없으면 `data-image-placeholder`와 source-aware caption을 사용합니다.

예시:

```text
Smith et al. (2024) Figure 3 삽입: 전체 모델 구조도.
research/ 안의 원본 PDF를 source of truth로 사용.
```

캡션에는 아래가 드러나야 합니다.
- 어떤 논문인지,
- 어떤 figure/table/equation을 넣어야 하는지,
- 왜 이 슬라이드에 필요한지

## 실패 처리
- `pdfinfo`, `pdftotext`, `pdfimages`가 없으면 텍스트 기반 분석과 placeholder로 계속 진행합니다.
- 논문에 접근할 수 없으면 PDF를 요청하거나 현재 확보한 텍스트만으로 진행합니다.
- 원문 근거가 없는 metric, figure 내용, table 수치를 만들어내지 마세요.
