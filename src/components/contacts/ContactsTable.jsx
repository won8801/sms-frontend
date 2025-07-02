import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function ContactsTable({ contacts, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <div>
        {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full my-2" />)}
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>전화번호</TableHead>
            <TableHead>메모</TableHead>
            <TableHead>등록일</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">연락처가 없습니다.</TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{contact.phone_number}</span>
                    <Badge variant="outline">{contact.country_code}</Badge>
                  </div>
                </TableCell>
                <TableCell>{contact.memo || '-'}</TableCell>
                <TableCell>{format(new Date(contact.created_date), "yyyy-MM-dd")}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onEdit(contact)}>
                        <Pencil className="w-4 h-4 mr-2" /> 수정
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(contact.id)} className="text-red-600">
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