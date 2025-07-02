import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Layout from "../Layout.jsx";
import Contacts from "../Contacts.jsx";
import History from "../History.jsx";
import AdminUsers from "../AdminUsers.jsx";
import AdminSettings from "../AdminSettings.jsx";
import Dashboard from "../Dashboard.jsx";
import SendSMS from "../SendSMS.jsx";
import Login from "../Login.jsx"; // ← 로그인 페이지 경로 확인 필요

// 페이지 이름 매핑
const PAGES = {
  Contacts,
  History,
  AdminUsers,
  AdminSettings,
  Dashboard,
  SendSMS,
};

// 현재 URL로부터 페이지 이름 추출
function _getCurrentPage(url) {
  if (url.endsWith('/')) url = url.slice(0, -1);
  let urlLastPart = url.split('/').pop();
  if (urlLastPart.includes('?')) {
    urlLastPart = urlLastPart.split('?')[0];
  }
  const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
  return pageName || Object.keys(PAGES)[0];
}

// 로그인 여부 확인 후 보호된 라우트 처리
function ProtectedRoute({ element }) {
  const isLoggedIn = !!localStorage.getItem("token");
  return isLoggedIn ? element : <Navigate to="/login" replace />;
}

// 페이지 콘텐츠 라우터
function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Routes>
      {/* 로그인 페이지는 Layout 없이 별도 처리 */}
      <Route path="/login" element={<Login />} />

      {/* 로그인 후 내부 페이지는 Layout 포함 */}
      <Route
        path="*"
        element={
          <Layout currentPageName={currentPage}>
            <Routes>
              <Route path="/" element={<ProtectedRoute element={<Contacts />} />} />
              <Route path="/Contacts" element={<ProtectedRoute element={<Contacts />} />} />
              <Route path="/History" element={<ProtectedRoute element={<History />} />} />
              <Route path="/AdminUsers" element={<ProtectedRoute element={<AdminUsers />} />} />
              <Route path="/AdminSettings" element={<ProtectedRoute element={<AdminSettings />} />} />
              <Route path="/Dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
              <Route path="/SendSMS" element={<ProtectedRoute element={<SendSMS />} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

// 루트 라우터
export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
