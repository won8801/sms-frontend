import Layout from "./Layout.jsx";

import Contacts from "./Contacts";
import History from "./History";
import AdminUsers from "./AdminUsers";
import AdminSettings from "./AdminSettings";
import Dashboard from "./Dashboard";
import SendSMS from "./SendSMS";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

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

// 페이지 콘텐츠
function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Contacts" element={<Contacts />} />
        <Route path="/History" element={<History />} />
        <Route path="/AdminUsers" element={<AdminUsers />} />
        <Route path="/AdminSettings" element={<AdminSettings />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/SendSMS" element={<SendSMS />} />
      </Routes>
    </Layout>
  );
}

// 최상위 라우터
export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
