import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

const statusConfig = {
  pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "대기중" },
  sent: { icon: CheckCircle, color: "bg-blue-100 text-blue-800", label: "발송완료" },
  delivered: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "전달완료" },
  failed: { icon: XCircle, color: "bg-red-100 text-red-800", label: "실패" },
  rejected: { icon: AlertCircle, color: "bg-red-100 text-red-800", label: "거부됨" }
};

export default function HistoryTable({ messages, isLoading, onRowClick }) {
  if (isLoading) {
    return (
      <div>
        {Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full my-2" />)}
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>수신자</TableHead>
            <TableHead>내용</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>발송시간</TableHead>
            <TableHead className="text-right">비용</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">발송 내역이 없습니다.</TableCell>
            </TableRow>
          ) : (
            messages.map((message) => {
              const status = statusConfig[message.status] || statusConfig.pending;
              return (
                <TableRow key={message.id} onClick={() => onRowClick(message)} className="cursor-pointer hover:bg-slate-50">
                  <TableCell className="font-medium">{message.recipient_number}</TableCell>
                  <TableCell className="truncate max-w-xs">{message.message_content}</TableCell>
                  <TableCell>
                    <Badge className={`${status.color} border-0`}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(message.send_time), "yyyy-MM-dd HH:mm")}</TableCell>
                  <TableCell className="text-right">{message.cost} C</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}