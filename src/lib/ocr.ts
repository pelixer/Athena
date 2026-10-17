/**
 * 도슨트 설명문 사진 → 텍스트.
 *
 * TODO(OCR): 엔진 미정. 후보는 브라우저 안에서 도는 Tesseract.js(한국어 정확도 보통, 오프라인)와
 * Claude 비전 API(정확도 높음, 서버 프록시 필요). 정해지기 전까지는 빈 문자열을 돌려주고,
 * 사용자가 오브제 상세에서 직접 고친다.
 */
export async function extractText(_photo: Blob): Promise<string> {
  return ''
}
