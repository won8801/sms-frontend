import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Calendar, Phone, Globe, DollarSign, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

export default function MessageDetails({ message }) {
  if (!message) {
    return (
      <Card className="glass-effect border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            메시지 상세 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-slate-500">목록에서 메시지를 선택하세요.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-0 shadow-lg sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          메시지 상세 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-slate-500">내용</h3>
          <p className="text-base p-3 bg-slate-50 rounded-md border">{message.message_content}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InfoItem icon={Phone} label="수신자" value={message.recipient_number} />
          <InfoItem icon={Globe} label="국가" value={message.country_code} />
          <InfoItem icon={Calendar} label="발송 시간" value={format(new Date(message.send_time), "yyyy-MM-dd HH:mm")} />
          <InfoItem icon={Calendar} label="수신 시간" value={message.delivered_time ? format(new Date(message.delivered_time), "HH:mm:ss") : '-'} />
          <InfoItem icon={DollarSign} label="비용" value={`${message.cost} 크레딧`} />
          <div className="space-y-1">
             <label className="text-sm font-medium text-slate-500 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/>상태</label>
             <Badge>{message.status}</Badge>
          </div>
        </div>
        {message.error_message && (
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-red-500 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/>오류 메시지</h3>
            <p className="text-sm p-2 bg-red-50 rounded-md border border-red-200 text-red-700">{message.error_message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-slate-500 flex items-center gap-1"><Icon className="w-4 h-4"/>{label}</label>
    <p className="text-sm font-semibold">{value}</p>
  </div>
);