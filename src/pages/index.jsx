import Layout from "./Layout.jsx";

import Contacts from "./Contacts";
import History from "./History";
import AdminUsers from "./AdminUsers";
import AdminSettings from "./AdminSettings";
import Dashboard from "./Dashboard";
import SendSMS from "./SendSMS";

import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

const PAGES = {
  Contacts,
  History,
  AdminUsers,
  AdminSettings,
  Dashboard,
  SendSMS,
};

function _getCurrentPage(url) {
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  let urlLastPart = url.split('/').pop();
  if (urlLastPart.includes('?')) {
    urlLastPart = urlLastPart.split('?')[0];
  }

  const pageName = Object.keys(PAGES).find(
    (page) => page.toLowerCase() === urlLastPart.toLowerCase()
  );
  return pageName || Object.keys(PAGES)[0];
}

// ✅ 로그인 보호용 Route 컴포넌트
function ProtectedRoute({ element }) {
  const isLoggedIn = !!localStorage.getItem("token");
  return isLoggedIn ? element : <Navigate to="/login" replace />;
}

function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        {/* 보호 라우트 적용 */}
        <Route path="/" element={<ProtectedRoute element={<Contacts />} />} />
        <Route path="/Contacts" element={<ProtectedRoute element={<Contacts />} />} />
        <Route path="/History" element={<ProtectedRoute element={<History />} />} />
        <Route path="/AdminUsers" element={<ProtectedRoute element={<AdminUsers />} />} />
        <Route path="/AdminSettings" element={<ProtectedRoute element={<AdminSettings />} />} />
        <Route path="/Dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/SendSMS" element={<ProtectedRoute element={<SendSMS />} />} />

        {/* 로그인 페이지 임시 라우트 */}
        <Route path="/login" element={<div style={{ padding: 40 }}><h2>🟢 Login Page Placeholder</h2><p>콘솔에서 localStorage.setItem("token", "123") 실행 후 새로고침 해보세요.</p></div>} />
      </Routes>
    </Layout>
  );
}

export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
