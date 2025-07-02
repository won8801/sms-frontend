
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  MessageSquare, 
  LayoutDashboard, 
  Send, 
  Users, 
  History,
  Settings,
  CreditCard,
  Shield,
  User as UserIcon
} from "lucide-react";
import { User } from "@/api/entities";

const userNavigationItems = [
  { title: "대시보드", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "문자 발송", url: createPageUrl("SendSMS"), icon: Send },
  { title: "연락처 관리", url: createPageUrl("Contacts"), icon: Users },
  { title: "발송 내역", url: createPageUrl("History"), icon: History },
];

const adminNavigationItems = [
  { title: "사용자 관리", url: createPageUrl("AdminUsers"), icon: Shield },
  { title: "시스템 설정", url: createPageUrl("AdminSettings"), icon: Settings },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.log("User not logged in");
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SMS Pro</h1>
                  <p className="text-xs text-gray-500 -mt-0.5">글로벌 문자 발송 서비스</p>
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-1">
              {userNavigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.url
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.title}
                </Link>
              ))}
              
              {isAdmin && (
                <div className="flex items-center ml-4 pl-4 border-l border-gray-200">
                  {adminNavigationItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === item.url
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </nav>

            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">
                      €{(user.credit_balance || 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UserIcon className="w-4 h-4" />
                    <span>{user.full_name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">SMS Pro</span>
              </div>
              <p className="text-sm text-gray-600">
                전세계 어디든 안전하고 빠른 문자 발송 서비스
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">서비스</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to={createPageUrl("SendSMS")} className="hover:text-blue-600">문자 발송</Link></li>
                <li><Link to={createPageUrl("Contacts")} className="hover:text-blue-600">연락처 관리</Link></li>
                <li><Link to={createPageUrl("History")} className="hover:text-blue-600">발송 내역</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">회사</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">회사소개</a></li>
                <li><a href="#" className="hover:text-blue-600">이용약관</a></li>
                <li><a href="#" className="hover:text-blue-600">개인정보처리방침</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
            © 2024 SMS Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
