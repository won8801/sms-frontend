import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestTube2, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const translations = {
  ko: {
    testSendTitle: "SMS 수신 테스트",
    testSendDesc: "실제 기기에서 SMS가 정상 수신되는지 테스트합니다",
    phoneNumber: "테스트 전화번호",
    phoneNumberPlaceholder: "예: 821012345678",
    country: "국가",
    sendTestBtn: "테스트 발송",
    testInfo: "테스트 문자 발송 후 40초 이내에 수신 여부를 확인합니다.",
    estimatedCost: "예상 비용"
  },
  en: {
    testSendTitle: "SMS Reception Test",
    testSendDesc: "Test if SMS is properly received on actual device",
    phoneNumber: "Test Phone Number",
    phoneNumberPlaceholder: "e.g., 821012345678",
    country: "Country",
    sendTestBtn: "Send Test",
    testInfo: "Reception status will be checked within 40 seconds after test SMS is sent.",
    estimatedCost: "Estimated Cost"
  },
  ja: {
    testSendTitle: "SMS受信テスト",
    testSendDesc: "実際のデバイスでSMSが正常に受信されるかテストします",
    phoneNumber: "テスト電話番号",
    phoneNumberPlaceholder: "例: 821012345678",
    country: "国",
    sendTestBtn: "テスト送信",
    testInfo: "テストSMS送信後40秒以内に受信状況を確認します。",
    estimatedCost: "予想コスト"
  }
};

export default function TestSendSection({ onSubmit, countryCodes, isLoading, language = 'ko' }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('KR');

  const t = translations[language] || translations.ko;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    onSubmit(phoneNumber, countryCode);
  };

  const selectedCountry = countryCodes.find(c => c.code === countryCode);
  const estimatedCost = selectedCountry ? (selectedCountry.cost / 10000).toFixed(4) : '0.0000';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <TestTube2 className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.testSendTitle}</h3>
        <p className="text-gray-600">{t.testSendDesc}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="test-country">{t.country}</Label>
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name} ({country.prefix})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="test-phone">{t.phoneNumber}</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="test-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t.phoneNumberPlaceholder}
                className="pl-9"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-purple-900">{t.estimatedCost}</span>
            <span className="text-lg font-bold text-purple-600">€{estimatedCost}</span>
          </div>
          <Alert>
            <TestTube2 className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {t.testInfo}
            </AlertDescription>
          </Alert>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
          disabled={isLoading || !phoneNumber.trim()}
        >
          <TestTube2 className="w-5 h-5 mr-2" />
          {isLoading ? '발송 중...' : t.sendTestBtn}
        </Button>
      </form>
    </div>
  );
}