import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function CreateUserForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'user',
    credit_balance: 0,
    is_active: true
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await onSubmit(formData);
      setFormData({
        full_name: '',
        email: '',
        role: 'user',
        credit_balance: 0,
        is_active: true
      });
    } catch (error) {
      setError('사용자 생성 중 오류가 발생했습니다. Google 계정이 필요할 수 있습니다.');
    }
  };

  const handleClose = () => {
    setFormData({
      full_name: '',
      email: '',
      role: 'user',
      credit_balance: 0,
      is_active: true
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 사용자 생성</DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="full_name">이름</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">이메일 (Google 계정)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="user@gmail.com"
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              유효한 Google 계정 이메일을 입력하세요
            </p>
          </div>

          <div>
            <Label htmlFor="role">권한</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">일반 사용자</SelectItem>
                <SelectItem value="admin">관리자</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="credit_balance">초기 유로 잔액</Label>
            <Input
              id="credit_balance"
              type="number"
              step="0.0001"
              min="0"
              value={formData.credit_balance}
              onChange={(e) => setFormData({...formData, credit_balance: parseFloat(e.target.value) || 0})}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">취소</Button>
            </DialogClose>
            <Button type="submit">사용자 생성</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}