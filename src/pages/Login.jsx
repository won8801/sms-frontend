import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await fetch("https://sms-backend-uxqz.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("로그인 실패");

      const data = await response.json();
      localStorage.setItem("token", data.token);
      navigate("/Dashboard");
    } catch (err) {
      alert("로그인 실패: " + err.message);
    }
  }

  return (
    <div style={{ padding: "50px", maxWidth: 400, margin: "auto" }}>
      <h2>🔐 로그인</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10, width: "100%" }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", marginBottom: 20, width: "100%" }}
        />
        <button type="submit" style={{ width: "100%" }}>로그인</button>
      </form>
    </div>
  );
}
