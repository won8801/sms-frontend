import Layout from "./Layout.jsx";

import Contacts from "./Contacts";
import History from "./History";
import AdminUsers from "./AdminUsers";
import AdminSettings from "./AdminSettings";
import Dashboard from "./Dashboard";
import SendSMS from "./SendSMS";
import Login from "./Login"; // ✅ 로그인 페이지 추가

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";

const PAGES = {
  Contacts,
  History,
  AdminUsers,
  AdminSettings,
  Dashboard,
  SendSMS,
};

function _getCurrentPage(url) {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  let urlLastPart = url.split("/").pop();
  if (urlLastPart.includes("?")) {
    urlLastPart = urlLastPart.split("?")[0];
  }

  const pageName = Object.keys(PAGES).find(
    (page) => page.toLowerCase() === urlLastPart.toLowerCase()
  );
  return pageName || Object.keys(PAGES)[0];
}

// ✅ 로그인 여부에 따라 접근 제어
function ProtectedRoute({ element }) {
  const isLoggedIn = !!localStorage.getItem("token");
  return isLoggedIn ? element : <Navigate to="/login" replace />;
}

function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Routes>
      {/* 로그인 페이지는 Layout 없이 */}
      <Route path="/login" element={<Login />} />

      {/* 로그인 성공 후 들어오는 페이지들은 Layout 포함 */}
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

export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
