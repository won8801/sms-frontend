
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Globe, MessageSquare, Upload, TestTube2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const translations = {
  ko: {
    recipientList: "수신자 목록",
    pasteNumbers: "전화번호를 한 줄에 하나씩 입력하세요",
    numbersPlaceholder: "821012345678\n821098765432\n...",
    fromContacts: "연락처에서 선택",
    selectContacts: "발송할 연락처 선택",
    country: "국가",
    messageContent: "메시지 내용",
    messagePlaceholder: "모든 수신자에게 발송할 메시지를 입력하세요...",
    sendBtn: "문자 발송",
    testSend: "테스트 발송",
    recipients: "수신자",
    estimatedCost: "예상 총 비용",
    balanceWarning: "잔액이 부족합니다.",
    noRecipients: "수신자를 선택하거나 입력해주세요.",
    messageAnalysis: "메시지 분석",
    encoding: "인코딩",
    characters: "글자 수",
    segments: "세그먼트",
    gsm7bit: "GSM 7비트",
    unicode: "유니코드"
  },
  en: {
    recipientList: "Recipient List",
    pasteNumbers: "Enter phone numbers, one per line",
    numbersPlaceholder: "821012345678\n821098765432\n...",
    fromContacts: "From Contacts",
    selectContacts: "Select contacts to send",
    country: "Country",
    messageContent: "Message Content",
    messagePlaceholder: "Enter message to send to all recipients...",
    sendBtn: "Send SMS",
    testSend: "Test Send",
    recipients: "recipients",
    estimatedCost: "Estimated Total Cost",
    balanceWarning: "Insufficient balance.",
    noRecipients: "Please select or enter recipients.",
    messageAnalysis: "Message Analysis",
    encoding: "Encoding",
    characters: "Characters",
    segments: "Segments",
    gsm7bit: "GSM 7-bit",
    unicode: "Unicode"
  },
  ja: {
    recipientList: "受信者リスト",
    pasteNumbers: "電話番号を1行に1つずつ入力してください",
    numbersPlaceholder: "821012345678\n821098765432\n...",
    fromContacts: "連絡先から",
    selectContacts: "送信する連絡先を選択",
    country: "国",
    messageContent: "メッセージ内容",
    messagePlaceholder: "すべての受信者に送信するメッセージを入力してください...",
    sendBtn: "SMS送信",
    testSend: "テスト送信",
    recipients: "受信者",
    estimatedCost: "予想総コスト",
    balanceWarning: "残高が不足しています。",
    noRecipients: "受信者を選択または入力してください。",
    messageAnalysis: "メッセージ分析",
    encoding: "エンコーディング",
    characters: "文字",
    segments: "セグメント",
    gsm7bit: "GSM 7ビット",
    unicode: "ユニコード"
  },
  zh: {
    recipientList: "收件人列表",
    pasteNumbers: "请一行输入一个电话号码",
    numbersPlaceholder: "821012345678\n821098765432\n...",
    fromContacts: "从联系人选择",
    selectContacts: "选择要发送的联系人",
    country: "国家",
    messageContent: "消息内容",
    messagePlaceholder: "输入发送给所有收件人的消息...",
    sendBtn: "发送短信",
    testSend: "测试发送",
    recipients: "收件人",
    estimatedCost: "预估总费用",
    balanceWarning: "余额不足。",
    noRecipients: "请选择或输入收件人。",
    messageAnalysis: "消息分析",
    encoding: "编码",
    characters: "字符数",
    segments: "片段",
    gsm7bit: "GSM 7位",
    unicode: "Unicode"
  }
};

const GSM_7BIT_CHARS = /^[\x00-\x7F]*$/;
const GSM_7BIT_EXTENDED = /[\[\]{}\\~€|]/g;

const calculateMessageInfo = (message) => {
  if (!message) return { chars: 0, segments: 0, encoding: 'GSM 7-bit', singleSegmentLimit: 160 };

  const isGSM7Bit = GSM_7BIT_CHARS.test(message);
  const extendedChars = (message.match(GSM_7BIT_EXTENDED) || []).length;
  
  if (isGSM7Bit) {
    const totalChars = message.length + extendedChars;
    const singleSegmentLimit = 160;
    const multiSegmentLimit = 153;
    
    let segments;
    if (totalChars <= singleSegmentLimit) {
      segments = 1;
    } else {
      segments = Math.ceil(totalChars / multiSegmentLimit);
    }
    
    return {
      chars: totalChars,
      segments,
      encoding: 'GSM 7-bit',
      singleSegmentLimit
    };
  } else {
    const totalChars = message.length;
    const singleSegmentLimit = 70;
    const multiSegmentLimit = 67;
    
    let segments;
    if (totalChars <= singleSegmentLimit) {
      segments = 1;
    } else {
      segments = Math.ceil(totalChars / multiSegmentLimit);
    }
    
    return {
      chars: totalChars,
      segments,
      encoding: 'Unicode',
      singleSegmentLimit
    };
  }
};

export default function BulkSendForm({ onSubmit, onTestSend, contacts, countryCodes, isLoading, user, language = 'ko' }) {
  const [formData, setFormData] = useState({
    recipients_input: '',
    selected_contacts: [],
    country_code: 'KR',
    message_content: ''
  });

  const t = translations[language] || translations.ko;
  const messageInfo = calculateMessageInfo(formData.message_content);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let recipients = [];
    
    if (formData.recipients_input.trim()) {
      const inputNumbers = formData.recipients_input
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      recipients = [...recipients, ...inputNumbers];
    }
    
    if (formData.selected_contacts.length > 0) {
      const contactNumbers = formData.selected_contacts.map(contactId => {
        const contact = contacts.find(c => c.id === contactId);
        return contact ? contact.phone_number : null;
      }).filter(Boolean);
      recipients = [...recipients, ...contactNumbers];
    }
    
    recipients = [...new Set(recipients)];
    
    if (recipients.length === 0) {
      alert(t.noRecipients);
      return;
    }
    
    onSubmit(recipients, formData.message_content, formData.country_code);
  };

  const handleTestSend = () => {
    if (formData.message_content) {
      onTestSend(formData.country_code, formData.message_content);
    }
  };

  const handleContactToggle = (contactId) => {
    setFormData(prev => ({
      ...prev,
      selected_contacts: prev.selected_contacts.includes(contactId)
        ? prev.selected_contacts.filter(id => id !== contactId)
        : [...prev.selected_contacts, contactId]
    }));
  };

  const totalRecipients = formData.recipients_input.split('\n').filter(line => line.trim().length > 0).length + formData.selected_contacts.length;

  const getFinalMultiplier = (user, countryCode) => {
    console.log("BulkSendForm - Calculating multiplier for:", user?.email, "country:", countryCode);
    console.log("User country_multipliers:", user?.country_multipliers);
    
    // 1. 사용자별 국가 승수가 있는지 확인 (0도 유효한 값으로 처리)
    if (user && user.country_multipliers && typeof user.country_multipliers === 'object') {
      const countryMultiplier = user.country_multipliers[countryCode];
      if (countryMultiplier !== undefined && typeof countryMultiplier === 'number') { 
        console.log("Using country-specific multiplier:", countryMultiplier);
        return countryMultiplier;
      }
    }
    
    // 2. 전체 승수 사용
    const defaultMultiplier = user?.sms_price_multiplier ?? 1.0;
    console.log("Using default multiplier:", defaultMultiplier);
    return defaultMultiplier;
  };

  const selectedCountry = countryCodes.find(c => c.country_code === formData.country_code);
  const baseCostPerSegment = selectedCountry ? selectedCountry.cost : 0;
  const priceMultiplier = getFinalMultiplier(user, formData.country_code);
  const finalCostPerSegment = baseCostPerSegment * priceMultiplier;
  
  console.log("Pricing calculation:", {
    selectedCountry: selectedCountry?.country_name,
    baseCost: baseCostPerSegment,
    multiplier: priceMultiplier,
    finalCost: finalCostPerSegment
  });
  
  const totalCost = (finalCostPerSegment * totalRecipients * messageInfo.segments).toFixed(4);
  const isBalanceSufficient = parseFloat(totalCost) <= (user?.credit_balance || 0);

  return (
    <div className="max-w-7xl mx-auto">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              {t.messageContent}
            </h3>
            
            <div className="mb-4">
              <Label htmlFor="bulk-message">{t.messageContent}</Label>
              <Textarea
                id="bulk-message"
                value={formData.message_content}
                onChange={(e) => setFormData({...formData, message_content: e.target.value})}
                placeholder={t.messagePlaceholder}
                className="mt-1 min-h-48 text-lg w-full resize-none"
                required
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              {t.recipientList}
            </h3>
            
            <div className="mb-4">
              <Label htmlFor="country">{t.country}</Label>
              <Select value={formData.country_code} onValueChange={(value) => setFormData({...formData, country_code: value})}>
                <SelectTrigger className="mt-1 max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map(country => (
                    <SelectItem key={country.country_code} value={country.country_code}>
                      {country.country_name} ({country.country_prefix})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-6">
              <Label htmlFor="recipients">{t.pasteNumbers}</Label>
              <Textarea
                id="recipients"
                value={formData.recipients_input}
                onChange={(e) => setFormData({...formData, recipients_input: e.target.value})}
                placeholder={t.numbersPlaceholder}
                className="mt-1 min-h-32 font-mono text-sm w-full"
              />
              {formData.recipients_input.split('\n').filter(line => line.trim().length > 0).length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  입력된 번호: {formData.recipients_input.split('\n').filter(line => line.trim().length > 0).length}개
                </p>
              )}
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                {t.fromContacts}
              </h4>
              
              <div className="max-h-48 overflow-y-auto space-y-2">
                {contacts.length === 0 ? (
                  <p className="text-gray-500 text-sm">등록된 연락처가 없습니다.</p>
                ) : (
                  contacts.map(contact => (
                    <div key={contact.id} className="flex items-center gap-3 p-3 bg-white rounded border">
                      <input
                        type="checkbox"
                        id={`contact-${contact.id}`}
                        checked={formData.selected_contacts.includes(contact.id)}
                        onChange={() => handleContactToggle(contact.id)}
                        className="rounded"
                      />
                      <label htmlFor={`contact-${contact.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-gray-600">{contact.phone_number}</div>
                      </label>
                    </div>
                  ))
                )}
              </div>
              
              {formData.selected_contacts.length > 0 && (
                <p className="text-sm text-gray-600 mt-3">
                  선택된 연락처: {formData.selected_contacts.length}개
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 우측 영역 */}
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">{t.messageAnalysis}</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">{t.encoding}</span>
                <Badge variant={messageInfo.encoding === 'GSM 7-bit' ? 'default' : 'secondary'}>
                  {messageInfo.encoding === 'GSM 7-bit' ? t.gsm7bit : t.unicode}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">{t.characters}</span>
                <span className="font-medium text-blue-900">
                  {messageInfo.chars} / {messageInfo.singleSegmentLimit}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">{t.segments}</span>
                <span className="font-medium text-blue-900">{messageInfo.segments}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4">발송 요약</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">총 수신자</span>
                <span className="font-medium text-green-900">{totalRecipients}명</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">기본 단가</span>
                <span className="font-medium text-green-900">€{baseCostPerSegment.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">적용 승수</span>
                <span className="font-medium text-green-900">x{priceMultiplier.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">최종 단가</span>
                <span className="font-medium text-green-900">€{finalCostPerSegment.toFixed(4)}</span>
              </div>
              <div className="border-t border-green-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700">{t.estimatedCost}</span>
                  <span className="text-lg font-bold text-green-600">€{totalCost}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">현재 잔액</span>
                <span className="font-medium text-green-900">€{(user?.credit_balance || 0).toFixed(4)}</span>
              </div>
            </div>
            {!isBalanceSufficient && totalRecipients > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{t.balanceWarning}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestSend}
              disabled={!formData.message_content || isLoading}
              className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <TestTube2 className="w-4 h-4 mr-2" />
              {t.testSend}
            </Button>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              disabled={isLoading || totalRecipients === 0 || !formData.message_content || !isBalanceSufficient}
            >
              <Globe className="w-5 h-5 mr-2" />
              {isLoading ? '발송 중...' : `${t.sendBtn} (${totalRecipients}명)`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
