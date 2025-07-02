import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function HistoryFilters({ onFilterChange }) {
  const [status, setStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState(null);

  const applyFilters = () => {
    onFilterChange({ status, searchTerm, dateRange });
  };
  
  const resetFilters = () => {
    setStatus('all');
    setSearchTerm('');
    setDateRange(null);
    onFilterChange({ status: 'all', searchTerm: '', dateRange: null });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      {/* Search */}
      <div className="relative">
        <label className="text-sm font-medium">검색</label>
        <Search className="absolute left-3 top-[calc(50%+8px)] -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="번호 또는 내용..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 mt-1"
        />
      </div>

      {/* Status Filter */}
      <div>
        <label className="text-sm font-medium">상태</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="delivered">전달 완료</SelectItem>
            <SelectItem value="sent">발송 완료</SelectItem>
            <SelectItem value="pending">대기중</SelectItem>
            <SelectItem value="failed">실패</SelectItem>
            <SelectItem value="rejected">거부됨</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Picker - Simplified to single date */}
      <div>
        <label className="text-sm font-medium">날짜</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange ? format(dateRange, "yyyy년 MM월 dd일") : "날짜 선택"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateRange} onSelect={setDateRange} />
          </PopoverContent>
        </Popover>
      </div>

      {/* Action Buttons */}
      <div className="md:col-span-3 flex justify-end gap-2">
        <Button variant="ghost" onClick={resetFilters}>초기화</Button>
        <Button onClick={applyFilters}>적용</Button>
      </div>
    </div>
  );
}