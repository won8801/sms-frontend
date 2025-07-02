const API_BASE = "https://sms-backend-uxqz.onrender.com"; // ← 실제 백엔드 주소로 수정하세요

// 📤 문자 전송 함수
export async function sendSMS(to, message) {
  try {
    const response = await fetch(`${API_BASE}/send-sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, message }),
    });

    if (!response.ok) {
      throw new Error("문자 전송 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("sendSMS error:", error);
    return { success: false, error: error.message };
  }
}

// 📜 문자 이력 조회 함수
export async function fetchHistory() {
  try {
    const response = await fetch(`${API_BASE}/history`);
    if (!response.ok) throw new Error("이력 조회 실패");
    return await response.json();
  } catch (error) {
    console.error("fetchHistory error:", error);
    return [];
  }
}

// 📂 파일 업로드 함수 (가짜 처리 또는 S3/Cloudinary 등으로 교체 가능)
export async function UploadFile({ file }) {
  console.log("📦 UploadFile called with:", file.name);
  // 현재는 직접 업로드 구현 안 되어 있으므로 가짜 URL 반환
  return Promise.resolve({
    file_url: "https://example.com/fake-file.xlsx",
  });
}

// 🧾 엑셀/CSV 분석 함수 (가짜 분석 결과 반환 - 필요시 라이브러리 추가)
export async function ExtractDataFromUploadedFile({ file_url, json_schema }) {
  console.log("🧪 Extracting from:", file_url);
  // 임시 데이터 (실제 구현은 SheetJS 등으로 가능)
  return Promise.resolve({
    status: "success",
    output: [
      {
        name: "홍길동",
        phone_number: "821012345678",
        country_code: "KR",
        memo: "가상 데이터",
        group_tags: "VIP;테스트"
      },
      {
        name: "김철수",
        phone_number: "821055544433",
        country_code: "KR",
        memo: "테스트",
        group_tags: "내부"
      }
    ]
  });
}
