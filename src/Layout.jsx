// src/Layout.jsx
import React from "react";

export default function Layout({ currentPageName, children }) {
  return (
    <div>
      <header style={{ padding: "1rem", background: "#f0f0f0" }}>
        <h1>{currentPageName}</h1>
      </header>
      <main style={{ padding: "1rem" }}>{children}</main>
    </div>
  );
}
