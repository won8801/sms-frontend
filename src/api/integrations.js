const API_BASE = "https://sms-backend-uxqz.onrender.com";

// 문자 전송 함수
export async function sendSMS(to, message) {
  try {
    const response = await fetch(`${API_BASE}/send-sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

// 문자 이력 조회 함수
export async function fetchHistory() {
  try {
    const response = await fetch(`${API_BASE}/history`);

    if (!response.ok) {
      throw new Error("이력 조회 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("fetchHistory error:", error);
    return [];
  }
}

// ✅ 임시 파일 업로드 함수 (빌드 에러 방지용)
export async function UploadFile(file) {
  console.log("UploadFile 호출됨:", file);
  // 추후 실제 파일 업로드 로직으로 교체 가능
  return { success: true, message: "파일 업로드 성공 (모의 응답)" };
}

// ✅ 임시 데이터 추출 함수 (BulkContactUploadDialog.jsx에서 요구할 수 있음)
export function ExtractDataFromUploadedFile(file) {
  console.log("ExtractDataFromUploadedFile 호출됨:", file);
  // 나중에 실제 Excel/CSV 파싱 로직 추가
  return [{ name: "홍길동", phone: "01012345678" }];
}
