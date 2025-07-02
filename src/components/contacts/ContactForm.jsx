import React, { useState, useEffect } from 'react';
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

export default function ContactForm({ isOpen, onClose, onSubmit, contact, countryCodes }) {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    country_code: 'KR',
    group_tags: [],
    memo: ''
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        phone_number: contact.phone_number || '',
        country_code: contact.country_code || 'KR',
        group_tags: contact.group_tags || [],
        memo: contact.memo || ''
      });
    } else {
      setFormData({
        name: '', phone_number: '', country_code: 'KR', group_tags: [], memo: ''
      });
    }
  }, [contact, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{contact ? '연락처 수정' : '새 연락처 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">이름</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="country_code">국가</Label>
            <Select value={formData.country_code} onValueChange={(value) => setFormData({...formData, country_code: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map(c => <SelectItem key={c.code} value={c.code}>{c.name} ({c.prefix})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="phone_number">전화번호</Label>
            <Input id="phone_number" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="memo">메모</Label>
            <Input id="memo" value={formData.memo} onChange={(e) => setFormData({...formData, memo: e.target.value})} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">취소</Button>
            </DialogClose>
            <Button type="submit">{contact ? '저장' : '추가'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}