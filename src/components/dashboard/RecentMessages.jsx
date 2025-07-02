
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { MessageSquare, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

const translations = {
  ko: {
    recentMessages: "최근 발송 내역",
    noMessages: "발송 내역이 없습니다",
    pending: "대기중",
    sent: "발송완료", 
    delivered: "전달완료",
    failed: "실패",
    rejected: "거부됨"
  },
  en: {
    recentMessages: "Recent Messages",
    noMessages: "No message history",
    pending: "Pending",
    sent: "Sent",
    delivered: "Delivered", 
    failed: "Failed",
    rejected: "Rejected"
  },
  ja: {
    recentMessages: "最近の送信履歴",
    noMessages: "送信履歴がありません",
    pending: "待機中",
    sent: "送信完了",
    delivered: "配信完了",
    failed: "失敗", 
    rejected: "拒否"
  },
  zh: {
    recentMessages: "最近发送记录",
    noMessages: "没有发送记录",
    pending: "等待中",
    sent: "已发送",
    delivered: "已送达",
    failed: "失败",
    rejected: "被拒绝"
  }
};

const statusConfig = {
  pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  sent: { icon: CheckCircle, color: "bg-blue-100 text-blue-800" },
  delivered: { icon: CheckCircle, color: "bg-green-100 text-green-800" },
  failed: { icon: XCircle, color: "bg-red-100 text-red-800" },
  rejected: { icon: AlertCircle, color: "bg-red-100 text-red-800" }
};

export default function RecentMessages({ messages, isLoading, language = 'ko' }) {
  const t = translations[language] || translations.ko;

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t.recentMessages}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          {t.recentMessages}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t.noMessages}</p>
          </div>
        ) : (
          messages.map((message) => {
            const status = statusConfig[message.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            
            return (
              <div key={message.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <StatusIcon className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {message.recipient_number}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {message.message_content}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {message.send_time && format(new Date(message.send_time), "MM/dd HH:mm")}
                  </p>
                </div>
                
                <Badge className={`${status.color} border-0 text-xs`}>
                  {t[message.status] || message.status}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
