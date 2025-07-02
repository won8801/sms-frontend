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
