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
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus } from 'lucide-react';
import { CountryPrice } from '@/api/entities';

export default function EditUserForm({ isOpen, onClose, onSubmit, user }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'user',
    credit_balance: 0,
    is_active: true,
    sms_price_multiplier: 1.0,
    country_multipliers: {}
  });
  const [countryMultipliersList, setCountryMultipliersList] = useState([]);
  const [allCountries, setAllCountries] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      const countries = await CountryPrice.list();
      setAllCountries(countries);
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (user && isOpen) {
      console.log("EditUserForm - Loading user:", user);
      const multipliers = user.country_multipliers || {};
      console.log("Existing country multipliers:", multipliers);
      
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role || 'user',
        credit_balance: user.credit_balance || 0,
        is_active: user.is_active !== false,
        sms_price_multiplier: user.sms_price_multiplier ?? 1.0,
        country_multipliers: multipliers
      });
      
      // Convert object to array for UI
      const multipliersList = Object.entries(multipliers).map(([code, val]) => ({ 
        country_code: code, 
        multiplier: parseFloat(val) || 1.0 
      }));
      setCountryMultipliersList(multipliersList);
      console.log("Converted to list:", multipliersList);
    } else if (!user && isOpen) {
      // Reset form for new user
      setFormData({
        full_name: '', email: '', role: 'user', credit_balance: 0, 
        is_active: true, sms_price_multiplier: 1.0, country_multipliers: {}
      });
      setCountryMultipliersList([]);
    }
  }, [user, isOpen]);

  const handleMultiplierChange = (index, field, value) => {
    const newList = [...countryMultipliersList];
    newList[index][field] = field === 'multiplier' ? parseFloat(value) || 1.0 : value;
    setCountryMultipliersList(newList);
    console.log("Updated multipliers list:", newList);
  };

  const addMultiplier = () => {
    setCountryMultipliersList([...countryMultipliersList, { country_code: '', multiplier: 1.0 }]);
  };

  const removeMultiplier = (index) => {
    setCountryMultipliersList(countryMultipliersList.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert array back to object
    const multipliersObject = countryMultipliersList.reduce((acc, item) => {
      if (item.country_code && item.country_code.trim()) {
        acc[item.country_code] = parseFloat(item.multiplier) || 1.0;
      }
      return acc;
    }, {});
    
    const finalData = { ...formData, country_multipliers: multipliersObject };
    console.log("Submitting user data:", finalData);
    
    onSubmit(finalData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{user ? '사용자 정보 수정' : '새 사용자 생성'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
            <Label htmlFor="email">이메일</Label>
            <Input 
              id="email" 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={!!user}
              required
            />
            {user && <p className="text-sm text-gray-500">이메일은 수정할 수 없습니다</p>}
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
            <Label htmlFor="credit_balance">유로 잔액</Label>
            <Input 
              id="credit_balance" 
              type="number" 
              step="0.0001" 
              value={formData.credit_balance} 
              onChange={(e) => setFormData({...formData, credit_balance: parseFloat(e.target.value) || 0})}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="is_active" 
              checked={formData.is_active} 
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
            <Label htmlFor="is_active">계정 활성화</Label>
          </div>
          
          <div className="space-y-2 pt-2 border-t mt-4">
            <Label>전체 가격 승수</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={formData.sms_price_multiplier} 
              onChange={(e) => setFormData({ ...formData, sms_price_multiplier: parseFloat(e.target.value) || 1.0 })} 
            />
            <p className="text-sm text-gray-500">개별 설정이 없는 모든 국가에 적용됩니다.</p>
          </div>

          <div className="space-y-2 pt-2 border-t mt-4">
            <div className="flex justify-between items-center">
              <Label>국가별 개별 가격 승수</Label>
              <Button type="button" size="sm" variant="outline" onClick={addMultiplier}>
                <Plus className="w-4 h-4 mr-2" />
                추가
              </Button>
            </div>
            <div className="space-y-3">
              {countryMultipliersList.map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 items-center">
                  <Select 
                    value={item.country_code} 
                    onValueChange={(value) => handleMultiplierChange(index, 'country_code', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="국가 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCountries.map(c => (
                        <SelectItem key={c.country_code} value={c.country_code}>
                          {c.country_name} ({c.country_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={item.multiplier} 
                    onChange={(e) => handleMultiplierChange(index, 'multiplier', e.target.value)} 
                    placeholder="1.0"
                  />
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => removeMultiplier(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            {countryMultipliersList.length === 0 && (
              <p className="text-sm text-gray-500">국가별 개별 설정이 없습니다. '추가' 버튼을 눌러 설정하세요.</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="secondary">취소</Button>
            </DialogClose>
            <Button type="submit">{user ? '저장' : '생성'}</Button>
          </DialogFooter>  
        </form>
      </DialogContent>
    </Dialog>
  );
}