import React from "react";

const History = () => {
  // 향후 메시지 기록이나 활동 로그 같은 데이터를 여기에 표시할 수 있음
  const dummyData = [
    { id: 1, message: "첫 번째 메시지", timestamp: "2025-07-01 10:00" },
    { id: 2, message: "두 번째 메시지", timestamp: "2025-07-02 14:30" },
    { id: 3, message: "세 번째 메시지", timestamp: "2025-07-03 09:15" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "16px" }}>📜 히스토리</h2>
      <ul>
        {dummyData.map((item) => (
          <li key={item.id} style={{ marginBottom: "8px" }}>
            <strong>{item.timestamp}</strong>: {item.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;
