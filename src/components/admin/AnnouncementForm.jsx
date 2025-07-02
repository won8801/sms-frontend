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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function AnnouncementForm({ isOpen, onClose, onSubmit, announcement }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: false,
    priority: 0,
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        is_active: announcement.is_active || false,
        priority: announcement.priority || 0,
        start_date: announcement.start_date || '',
        end_date: announcement.end_date || ''
      });
    } else {
      setFormData({
        title: '',
        content: '',
        is_active: false,
        priority: 0,
        start_date: '',
        end_date: ''
      });
    }
  }, [announcement, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{announcement ? '공지사항 수정' : '새 공지사항 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">제목</Label>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="content">내용</Label>
            <Textarea 
              id="content" 
              value={formData.content} 
              onChange={(e) => setFormData({...formData, content: e.target.value})} 
              className="min-h-32" 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">우선순위</Label>
              <Input 
                id="priority" 
                type="number" 
                value={formData.priority} 
                onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})} 
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox 
                id="is_active" 
                checked={formData.is_active} 
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})} 
              />
              <Label htmlFor="is_active">즉시 활성화</Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">시작일 (선택사항)</Label>
              <Input 
                id="start_date" 
                type="date" 
                value={formData.start_date} 
                onChange={(e) => setFormData({...formData, start_date: e.target.value})} 
              />
            </div>
            <div>
              <Label htmlFor="end_date">종료일 (선택사항)</Label>
              <Input 
                id="end_date" 
                type="date" 
                value={formData.end_date} 
                onChange={(e) => setFormData({...formData, end_date: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">취소</Button>
            </DialogClose>
            <Button type="submit">{announcement ? '저장' : '추가'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}