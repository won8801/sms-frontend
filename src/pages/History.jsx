import React, { useState, useEffect } from "react";
import { SMS } from "@/api/entities";
import { History as HistoryIcon, SlidersHorizontal, MessageSquare } from "lucide-react";
import HistoryTable from "../components/history/HistoryTable";
import HistoryFilters from "../components/history/HistoryFilters";
import MessageDetails from "../components/history/MessageDetails";

export default function History() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null,
    searchTerm: ''
  });
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setIsLoading(true);
    const data = await SMS.list("-send_time");
    setMessages(data);
    setIsLoading(false);
  };

  const filteredMessages = messages.filter(msg => {
    const statusMatch = filters.status === 'all' || msg.status === filters.status;
    const searchMatch = msg.recipient_number.includes(filters.searchTerm) || msg.message_content.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const dateMatch = !filters.dateRange || (new Date(msg.send_time).toDateString() === filters.dateRange.toDateString());
    return statusMatch && searchMatch && dateMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">발송 내역</h1>
        <p className="text-gray-600">모든 발송 기록을 확인하고 검색하세요</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-blue-600" />
          필터 및 검색
        </h2>
        <HistoryFilters onFilterChange={setFilters} />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-blue-600" />
                발송 기록 ({filteredMessages.length}건)
              </h2>
            </div>
            <div className="p-6">
              <HistoryTable
                messages={filteredMessages}
                isLoading={isLoading}
                onRowClick={setSelectedMessage}
              />
            </div>
          </div>
        </div>
        <div>
          <MessageDetails message={selectedMessage} />
        </div>
      </div>
    </div>
  );
}