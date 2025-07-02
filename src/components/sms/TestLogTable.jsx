import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestTube2, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const translations = {
  ko: {
    testResults: "테스트 발송 결과",
    noTestLogs: "테스트 발송 기록이 없습니다",
    pending: "대기중",
    success: "성공",
    timed_out: "시간초과",
    failed_delivery: "실패"
  },
  en: {
    testResults: "Test Send Results",
    noTestLogs: "No test logs available",
    pending: "Pending",
    success: "Success", 
    timed_out: "Timed Out",
    failed_delivery: "Failed"
  },
  ja: {
    testResults: "テスト送信結果",
    noTestLogs: "テスト送信記録がありません",
    pending: "待機中",
    success: "成功",
    timed_out: "タイムアウト",
    failed_delivery: "失敗"
  },
  zh: {
    testResults: "测试发送结果",
    noTestLogs: "没有测试发送记录",
    pending: "等待中",
    success: "成功",
    timed_out: "超时",
    failed_delivery: "失败"
  }
};

const statusConfig = {
  pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  success: { icon: CheckCircle, color: "bg-green-100 text-green-800" },
  timed_out: { icon: AlertTriangle, color: "bg-red-100 text-red-800" },
  failed_delivery: { icon: XCircle, color: "bg-red-100 text-red-800" }
};

export default function TestLogTable({ testLogs, language = 'ko' }) {
  const t = translations[language] || translations.ko;

  // test_uuid로 그룹화하고 최신 순으로 정렬
  const groupedTests = React.useMemo(() => {
    if (!testLogs || testLogs.length === 0) return [];

    const groups = testLogs.reduce((acc, log) => {
      const uuid = log.test_uuid || 'unknown';
      if (!acc[uuid]) {
        acc[uuid] = [];
      }
      acc[uuid].push(log);
      return acc;
    }, {});

    // 각 그룹을 test_type 순서로 정렬하고, 그룹들을 최신 발송 시간 순으로 정렬
    return Object.entries(groups)
      .map(([uuid, logs]) => ({
        uuid,
        logs: logs.sort((a, b) => (a.test_type || '').localeCompare(b.test_type || '')),
        latestTime: Math.max(...logs.map(log => new Date(log.send_time).getTime()))
      }))
      .sort((a, b) => b.latestTime - a.latestTime)
      .slice(0, 10); // 최신 10개 그룹만 표시
  }, [testLogs]);

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube2 className="w-5 h-5 text-purple-600" />
          {t.testResults}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {groupedTests.length === 0 ? (
          <div className="text-center py-8">
            <TestTube2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t.noTestLogs}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedTests.map((group) => (
              <div key={group.uuid} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600">
                    {format(new Date(group.latestTime), "yyyy-MM-dd HH:mm")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {group.logs[0]?.country_code || 'Unknown'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {group.logs.map((log) => {
                    const status = statusConfig[log.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    const testLabel = `${log.country_code || ''}${(log.test_type || '').replace('t', '')}`;

                    return (
                      <div key={log.id} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-800">{testLabel}</h4>
                          <Badge className={`${status.color} border-0 flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {t[log.status] || log.status}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>번호: {log.recipient_number}</div>
                          <div>비용: €{(log.cost || 0).toFixed(4)}</div>
                          {log.receipt_time && (
                            <div>수신: {format(new Date(log.receipt_time), "HH:mm:ss")}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}