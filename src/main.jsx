import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";          // App 컴포넌트 불러오기
import "./index.css";                // 전역 스타일 (없으면 삭제 가능)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
