
import React, { useState, useEffect } from "react";
import { SMS } from "@/api/entities";
import { User } from "@/api/entities";
import { Announcement } from "@/api/entities"; // Added Announcement import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Send, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Globe,
  CreditCard,
  History // Added History icon import
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardStats from "../components/dashboard/DashboardStats";
import RecentMessages from "../components/dashboard/RecentMessages";
import UsageChart from "../components/dashboard/UsageChart";

// 다국어 지원
const translations = {
  ko: {
    dashboard: "대시보드",
    subtitle: "SMS 발송 현황을 한눈에 확인하세요",
    sendSMS: "문자 발송",
    totalSent: "총 발송",
    sentComplete: "발송 완료",
    delivered: "전달 완료",
    creditBalance: "유로 잔액", // Updated
    today: "오늘",
    successRate: "성공률",
    deliveryRate: "전달률",
    thisWeek: "이번 주",
    quickActions: "빠른 작업",
    singleSend: "문자 발송", // Updated
    singleSendDesc: "문자 메시지 발송하기", // Updated
    contactManage: "연락처 관리", 
    contactManageDesc: "연락처 추가 및 관리",
    telegramConsult: "텔레그램 상담", // Added
    telegramConsultDesc: "즉시 상담받기", // Added
    historyManage: "발송 내역", // Added
    historyManageDesc: "발송 기록 확인" // Added
  },
  en: {
    dashboard: "Dashboard",
    subtitle: "Monitor your SMS sending status at a glance",
    sendSMS: "Send SMS",
    totalSent: "Total Sent",
    sentComplete: "Sent Complete",
    delivered: "Delivered",
    creditBalance: "Euro Balance", // Updated
    today: "Today",
    successRate: "Success Rate",
    deliveryRate: "Delivery Rate", 
    thisWeek: "This Week",
    quickActions: "Quick Actions",
    singleSend: "Send SMS", // Updated
    singleSendDesc: "Send text messages", // Updated
    contactManage: "Contact Management",
    contactManageDesc: "Add and manage contacts",
    telegramConsult: "Telegram Consultation", // Added
    telegramConsultDesc: "Get instant consultation", // Added
    historyManage: "Send History", // Added
    historyManageDesc: "Check sending records" // Added
  },
  ja: {
    dashboard: "ダッシュボード",
    subtitle: "SMS送信状況を一目で確認",
    sendSMS: "SMS送信",
    totalSent: "総送信数",
    sentComplete: "送信完了", 
    delivered: "配信完了",
    creditBalance: "ユーロ残高", // Updated
    today: "今日",
    successRate: "成功率",
    deliveryRate: "配信率",
    thisWeek: "今週",
    quickActions: "クイックアクション",
    singleSend: "SMS送信", // Updated
    singleSendDesc: "テキストメッセージ送信", // Updated
    contactManage: "連絡先管理",
    contactManageDesc: "連絡先の追加と管理", 
    telegramConsult: "Telegram相談", // Added
    telegramConsultDesc: "すぐに相談する", // Added
    historyManage: "送信履歴", // Added
    historyManageDesc: "送信記録の確認" // Added
  },
  zh: {
    dashboard: "仪表板",
    subtitle: "一目了然地查看短信发送状态",
    sendSMS: "发送短信", 
    totalSent: "总发送量",
    sentComplete: "发送完成",
    delivered: "已送达",
    creditBalance: "欧元余额", // Updated
    today: "今天",
    successRate: "成功率",
    deliveryRate: "送达率",
    thisWeek: "本周",
    quickActions: "快速操作",
    singleSend: "发送短信", // Updated
    singleSendDesc: "发送单条消息", // Updated
    contactManage: "联系人管理",
    contactManageDesc: "添加和管理联系人",
    telegramConsult: "电报咨询", // Added
    telegramConsultDesc: "即时咨询", // Added
    historyManage: "发送记录", // Added
    historyManageDesc: "查看发送记录" // Added
  }
};

// 국가별 언어 자동 감지
const getLanguageByCountry = () => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language || navigator.userLanguage;
    
    // 시간대 또는 브라우저 언어로 국가 판단
    if (timeZone.includes('Asia/Seoul') || language.startsWith('ko')) return 'ko';
    if (timeZone.includes('Asia/Tokyo') || language.startsWith('ja')) return 'ja';
    if (timeZone.includes('Asia/Shanghai') || timeZone.includes('Asia/Beijing') || language.startsWith('zh')) return 'zh';
    if (language.startsWith('en')) return 'en';
    
    // 기본값은 한국어
    return 'ko';
  } catch {
    return 'ko';
  }
};

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]); // Added announcements state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState(getLanguageByCountry());
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    todayCount: 0,
    thisWeekCost: 0
  });

  const t = translations[language] || translations.ko;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [messagesData, userData, announcementsData] = await Promise.all([ // Modified
        SMS.list("-send_time", 100),
        User.me(),
        Announcement.filter({ is_active: true }, "-priority") // Added Announcement fetch
      ]);

      setMessages(messagesData);
      setUser(userData);
      setAnnouncements(announcementsData); // Set announcements state

      // Calculate stats
      const today = new Date().toDateString();
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const statsCalc = {
        total: messagesData.length,
        sent: messagesData.filter(m => m.status === 'sent' || m.status === 'delivered').length,
        delivered: messagesData.filter(m => m.status === 'delivered').length,
        failed: messagesData.filter(m => m.status === 'failed' || m.status === 'rejected').length,
        todayCount: messagesData.filter(m => new Date(m.send_time).toDateString() === today).length,
        thisWeekCost: messagesData
          .filter(m => new Date(m.send_time) >= weekAgo)
          .reduce((sum, m) => sum + (m.cost || 0), 0)
      };

      setStats(statsCalc);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Language Selector */}
      <div className="flex justify-end">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="zh">中文</option>
        </select>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">{announcement.title}</h3>
              <p className="text-blue-800">{announcement.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.dashboard}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
          
          <div className="flex gap-3">
            <Link to={createPageUrl("SendSMS")}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                <Send className="w-5 h-5 mr-2" />
                {t.sendSMS}
              </Button>
            </Link>
            <a href="https://t.me/Seoul010" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-2">
                <MessageSquare className="w-5 h-5 mr-2" />
                {t.telegramConsult}
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStats
          title={t.totalSent}
          value={stats.total.toLocaleString()}
          icon={MessageSquare}
          color="blue"
          trend={`+${stats.todayCount} ${t.today}`}
          loading={isLoading}
        />
        
        <DashboardStats
          title={t.sentComplete}
          value={stats.sent.toLocaleString()}
          icon={CheckCircle}
          color="green"
          trend={`${((stats.sent / stats.total) * 100 || 0).toFixed(1)}% ${t.successRate}`}
          loading={isLoading}
        />
        
        <DashboardStats
          title={t.delivered}
          value={stats.delivered.toLocaleString()}
          icon={Globe}
          color="purple"
          trend={`${((stats.delivered / stats.total) * 100 || 0).toFixed(1)}% ${t.deliveryRate}`}
          loading={isLoading}
        />
        
        <DashboardStats
          title={t.creditBalance}
          value={`€${(user?.credit_balance || 0).toFixed(4)}`}
          icon={CreditCard}
          color="orange"
          trend={`-€${stats.thisWeekCost.toFixed(4)} ${t.thisWeek}`}
          loading={isLoading}
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UsageChart messages={messages} isLoading={isLoading} language={language} />
        </div>
        
        <div>
          <RecentMessages messages={messages.slice(0, 10)} isLoading={isLoading} language={language} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          {t.quickActions}
        </h2>
        <div className="grid md:grid-cols-4 gap-6"> {/* Changed to 4 columns */}
          <Link to={createPageUrl("SendSMS")} className="group">
            <div className="bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-200 rounded-lg p-6 text-center transition-all duration-200">
              <Send className="w-10 h-10 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.singleSend}</h3>
              <p className="text-sm text-gray-600">{t.singleSendDesc}</p>
            </div>
          </Link>
          
          <Link to={createPageUrl("Contacts")} className="group">
            <div className="bg-gray-50 hover:bg-green-50 border-2 border-gray-200 hover:border-green-200 rounded-lg p-6 text-center transition-all duration-200">
              <Globe className="w-10 h-10 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.contactManage}</h3>
              <p className="text-sm text-gray-600">{t.contactManageDesc}</p>
            </div>
          </Link>
          
          <Link to={createPageUrl("History")} className="group"> {/* Changed link */}
            <div className="bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-200 rounded-lg p-6 text-center transition-all duration-200">
              <History className="w-10 h-10 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform" /> {/* Changed icon */}
              <h3 className="font-semibold text-gray-900 mb-2">{t.historyManage}</h3> {/* Changed text */}
              <p className="text-sm text-gray-600">{t.historyManageDesc}</p> {/* Changed text */}
            </div>
          </Link>

          <a href="https://t.me/Seoul010" target="_blank" rel="noopener noreferrer" className="group">
            <div className="bg-gray-50 hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-200 rounded-lg p-6 text-center transition-all duration-200">
              <MessageSquare className="w-10 h-10 text-orange-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.telegramConsult}</h3>
              <p className="text-sm text-gray-600">{t.telegramConsultDesc}</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
