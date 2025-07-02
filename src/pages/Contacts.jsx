
import React, { useState, useEffect } from "react";
import { Contact } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Users, Search, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ContactsTable from "../components/contacts/ContactsTable";
import ContactForm from "../components/contacts/ContactForm";
import BulkContactUploadDialog from "../components/contacts/BulkContactUploadDialog";

const COUNTRY_CODES = [
  { code: 'KR', name: '한국', prefix: '+82' },
  { code: 'US', name: '미국', prefix: '+1' },
  { code: 'JP', name: '일본', prefix: '+81' },
  { code: 'CN', name: '중국', prefix: '+86' },
  { code: 'GB', name: '영국', prefix: '+44' },
  { code: 'DE', name: '독일', prefix: '+49' },
  { code: 'FR', name: '프랑스', prefix: '+33' },
  { code: 'TH', name: '태국', prefix: '+66' },
  { code: 'VN', name: '베트남', prefix: '+84' },
  { code: 'PH', name: '필리핀', prefix: '+63' }
];

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoading(true);
    const data = await Contact.list("-created_date");
    setContacts(data);
    setIsLoading(false);
  };

  const handleFormSubmit = async (formData) => {
    if (editingContact) {
      await Contact.update(editingContact.id, formData);
    } else {
      await Contact.create(formData);
    }
    await loadContacts();
    closeForm();
  };

  const handleBulkUpload = async (contactsData) => {
    try {
      // 데이터 변환 및 유효성 검사
      const validContacts = contactsData.map(contact => ({
        name: contact.name,
        phone_number: contact.phone_number,
        country_code: contact.country_code || 'KR',
        memo: contact.memo || '',
        group_tags: Array.isArray(contact.group_tags) ? contact.group_tags : 
                   (contact.group_tags ? contact.group_tags.split(';').map(tag => tag.trim()) : [])
      }));

      await Contact.bulkCreate(validContacts);
      await loadContacts();
      setIsBulkUploadOpen(false); // Close dialog after successful upload
    } catch (error) {
      console.error("Error bulk uploading contacts:", error);
      throw error;
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleDelete = async (contactId) => {
    await Contact.delete(contactId);
    await loadContacts();
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingContact(null);
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone_number.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">연락처 관리</h1>
            <p className="text-gray-600">고객 정보를 효율적으로 관리하세요</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="이름 또는 전화번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-80"
              />
            </div>
            <Button
              onClick={() => setIsBulkUploadOpen(true)}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              대량 추가
            </Button>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 연락처 추가
            </Button>
          </div>
        </div>
      </div>

      {/* Form Dialog */}
      <ContactForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        contact={editingContact}
        countryCodes={COUNTRY_CODES}
      />

      {/* Bulk Upload Dialog */}
      <BulkContactUploadDialog
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSubmit={handleBulkUpload}
      />

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            연락처 목록 ({filteredContacts.length}개)
          </h2>
        </div>
        <div className="p-6">
          <ContactsTable
            contacts={filteredContacts}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
