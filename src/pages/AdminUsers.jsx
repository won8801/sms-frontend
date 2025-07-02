import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UsersTable from "../components/admin/UsersTable";
import EditUserForm from "../components/admin/EditUserForm";
import CreateUserForm from "../components/admin/CreateUserForm";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await User.list("-created_date");
    setUsers(data);
    setIsLoading(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsEditFormOpen(true);
  };

  const handleDelete = async (userId) => {
    if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      await User.delete(userId);
      await loadUsers();
    }
  };

  const handleEditSubmit = async (formData) => {
    await User.update(editingUser.id, formData);
    await loadUsers();
    setIsEditFormOpen(false);
    setEditingUser(null);
  };

  const handleCreateSubmit = async (formData) => {
    await User.create(formData);
    await loadUsers();
    setIsCreateFormOpen(false);
  };

  const closeEditForm = () => {
    setIsEditFormOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">사용자 관리</h1>
            <p className="text-gray-600">시스템 사용자들을 관리하고 권한을 설정하세요</p>
          </div>
          <Button
            onClick={() => setIsCreateFormOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 사용자 생성
          </Button>
        </div>
      </div>

      <CreateUserForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <EditUserForm
        isOpen={isEditFormOpen}
        onClose={closeEditForm}
        onSubmit={handleEditSubmit}
        user={editingUser}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            사용자 목록 ({users.length}명)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={users}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}