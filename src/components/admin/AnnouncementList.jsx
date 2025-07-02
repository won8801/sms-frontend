import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function AnnouncementList({ announcements, onEdit, onDelete, onToggle }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>제목</TableHead>
            <TableHead>내용</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>우선순위</TableHead>
            <TableHead>생성일</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">공지사항이 없습니다.</TableCell>
            </TableRow>
          ) : (
            announcements.map((announcement) => (
              <TableRow key={announcement.id}>
                <TableCell className="font-medium max-w-xs">
                  <div className="truncate">{announcement.title}</div>
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="truncate text-sm text-gray-600">{announcement.content}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={announcement.is_active ? "default" : "secondary"}>
                    {announcement.is_active ? "활성" : "비활성"}
                  </Badge>
                </TableCell>
                <TableCell>{announcement.priority || 0}</TableCell>
                <TableCell>{format(new Date(announcement.created_date), "yyyy-MM-dd")}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onToggle(announcement)}>
                        {announcement.is_active ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" /> 비활성화
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" /> 활성화
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(announcement)}>
                        <Pencil className="w-4 h-4 mr-2" /> 수정
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(announcement.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" /> 삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}