
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

const COLORS = ['#0066FF', '#00C851', '#FF6B6B', '#FFB74D', '#9C27B0'];

const translations = {
  ko: {
    usageStats: "최근 7일 발송 현황",
    statusDistribution: "발송 상태 분포",
    pending: "대기중",
    sent: "발송완료",
    delivered: "전달완료", 
    failed: "실패",
    rejected: "거부됨",
    items: "건"
  },
  en: {
    usageStats: "Last 7 Days Usage",
    statusDistribution: "Status Distribution",
    pending: "Pending",
    sent: "Sent",
    delivered: "Delivered",
    failed: "Failed", 
    rejected: "Rejected",
    items: "items"
  },
  ja: {
    usageStats: "過去7日間の送信状況",
    statusDistribution: "送信状態分布",
    pending: "待機中",
    sent: "送信完了",
    delivered: "配信完了",
    failed: "失敗",
    rejected: "拒否",
    items: "件"
  },
  zh: {
    usageStats: "最近7天发送情况",
    statusDistribution: "发送状态分布", 
    pending: "等待中",
    sent: "已发送",
    delivered: "已送达",
    failed: "失败",
    rejected: "被拒绝",
    items: "条"
  }
};

export default function UsageChart({ messages, isLoading, language = 'ko' }) {
  const t = translations[language] || translations.ko;

  const getDailyUsage = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dayMessages = messages.filter(m => 
        startOfDay(new Date(m.send_time)).getTime() === date.getTime()
      );
      
      days.push({
        date: format(date, 'MM/dd'),
        total: dayMessages.length,
        sent: dayMessages.filter(m => m.status === 'sent' || m.status === 'delivered').length,
        failed: dayMessages.filter(m => m.status === 'failed' || m.status === 'rejected').length
      });
    }
    return days;
  };

  const getStatusData = () => {
    const statusCounts = {
      sent: messages.filter(m => m.status === 'sent').length,
      delivered: messages.filter(m => m.status === 'delivered').length,
      failed: messages.filter(m => m.status === 'failed').length,
      pending: messages.filter(m => m.status === 'pending').length,
      rejected: messages.filter(m => m.status === 'rejected').length
    };

    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: t[status] || status,
        value: count,
        percentage: ((count / messages.length) * 100).toFixed(1)
      }));
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t.usageStats}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const dailyData = getDailyUsage();
  const statusData = getStatusData();

  return (
    <div className="space-y-6">
      {/* Daily Usage Chart */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            {t.usageStats}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#64748b"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#64748b"
                />
                <Bar dataKey="sent" fill="#0066FF" radius={[2, 2, 0, 0]} />
                <Bar dataKey="failed" fill="#FF6B6B" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      {statusData.length > 0 && (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              {t.statusDistribution}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 space-y-3">
                {statusData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{item.value}{t.items}</span>
                      <span className="text-xs text-slate-500 ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
