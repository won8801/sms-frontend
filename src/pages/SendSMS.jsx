
import React, { useState, useEffect } from "react";
import { SMS } from "@/api/entities";
import { Contact } from "@/api/entities";
import { TestLog } from "@/api/entities";
import { User } from "@/api/entities";
import { Setting } from "@/api/entities";
import { CountryPrice } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
import BulkSendForm from "../components/sms/BulkSendForm";
import TestLogTable from "../components/sms/TestLogTable";

const translations = {
  ko: {
    sendSMS: "문자 발송",
    sentSuccess: "문자가 성공적으로 발송되었습니다.",
    balanceInsufficient: "잔액이 부족합니다. 충전 후 이용해주세요.",
    sendError: "문자 발송 중 오류가 발생했습니다.",
    testSendSuccess: "테스트 발송 성공!",
    testSendFailed: "테스트 발송 실패 (40초 이후 수신된 내용은 실패로 처리됩니다)",
    noTestNumber: "테스트 번호가 설정되지 않았습니다. 관리자에게 문의하세요."
  },
  en: {
    sendSMS: "Send SMS",
    sentSuccess: "SMS sent successfully.",
    balanceInsufficient: "Insufficient balance. Please recharge first.",
    sendError: "Error occurred while sending SMS.",
    testSendSuccess: "Test send successful!",
    testSendFailed: "Test send failed (Contents received after 40 seconds are treated as failed)",
    noTestNumber: "Test number is not set. Please contact an administrator."
  },
  ja: {
    sendSMS: "SMS送信",
    sentSuccess: "SMSが正常に送信されました。",
    balanceInsufficient: "残高が不足しています。チャージしてからご利用ください。",
    sendError: "SMS送信中にエラーが発生しました.",
    testSendSuccess: "テスト送信成功！",
    testSendFailed: "テスト送信失敗 (40秒後に受信された内容は失敗として処理されます)",
    noTestNumber: "テスト番号が設定されていません。管理者に連絡してください。"
  },
  zh: {
    sendSMS: "发送短信",
    sentSuccess: "短信发送成功。",
    balanceInsufficient: "余额不足，请充值后使用。",
    sendError: "发送短信时发生错误。",
    testSendSuccess: "测试发送成功！",
    testSendFailed: "测试发送失败 (40秒后接收到的内容将被视为失败)",
    noTestNumber: "未设置测试号码。请联系管理员。"
  }
};

const getLanguageByCountry = () => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language || navigator.userLanguage;
    
    if (timeZone.includes('Asia/Seoul') || language.startsWith('ko')) return 'ko';
    if (timeZone.includes('Asia/Tokyo') || language.startsWith('ja')) return 'ja';
    if (timeZone.includes('Asia/Shanghai') || timeZone.includes('Asia/Beijing') || language.startsWith('zh')) return 'zh';
    if (language.startsWith('en')) return 'en';
    
    return 'ko';
  } catch {
    return 'ko';
  }
};

const GSM_7BIT_CHARS = /^[\x00-\x7F]*$/;
const GSM_7BIT_EXTENDED = /[\[\]{}\\~€|]/g;

const calculateMessageInfo = (message) => {
  if (!message) return { chars: 0, segments: 1, encoding: 'GSM 7-bit', singleSegmentLimit: 160 };

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
    if (segments === 0) segments = 1;
    
    return { chars: totalChars, segments, encoding: 'GSM 7-bit', singleSegmentLimit };
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
    if (segments === 0) segments = 1;

    return { chars: totalChars, segments, encoding: 'Unicode', singleSegmentLimit };
  }
};

export default function SendSMS() {
  const [contacts, setContacts] = useState([]);
  const [countryPrices, setCountryPrices] = useState([]);
  const [testLogs, setTestLogs] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [language, setLanguage] = useState(getLanguageByCountry());

  const t = translations[language] || translations.ko;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [contactsData, userData, testLogsData, countryPricesData] = await Promise.all([
        Contact.list("-created_date"),
        User.me(),
        TestLog.list("-send_time", 10), // Increased limit for better view
        CountryPrice.list()
      ]);
      
      // 사용자 데이터 정규화: country_multipliers가 없으면 빈 객체로 초기화
      const normalizedUser = {
        ...userData,
        country_multipliers: userData.country_multipliers || {}
      };

      setContacts(contactsData);
      setUser(normalizedUser);
      setTestLogs(testLogsData);
      setCountryPrices(countryPricesData);
      
      console.log("User data loaded and normalized:", normalizedUser);
      console.log("Country multipliers:", normalizedUser?.country_multipliers);

    } catch (error) {
      console.error("Error loading data:", error);
      showAlert('error', '데이터 로딩 중 오류가 발생했습니다.');
    }
    setIsLoading(false);
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const getFinalMultiplier = (user, countryCode) => {
    console.log("Calculating multiplier for user:", user?.email, "country:", countryCode);
    
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

  const handleBulkSend = async (recipients, messageContent, countryCode) => {
    setIsLoading(true);
    try {
      const country = countryPrices.find(c => c.country_code === countryCode);
      if (!country) {
        showAlert('error', '선택된 국가의 가격 정보를 찾을 수 없습니다.');
        setIsLoading(false);
        return;
      }
      
      const priceMultiplier = getFinalMultiplier(user, countryCode);
      const messageInfo = calculateMessageInfo(messageContent);
      const costPerMessage = country.cost * priceMultiplier * messageInfo.segments;
      
      const smsPromises = recipients.map(phone => 
        SMS.create({
          recipient_number: phone,
          sender_number: user.email,
          message_content: messageContent,
          message_type: 'SMS',
          country_code: countryCode,
          status: 'sent',
          send_time: new Date(),
          cost: costPerMessage
        })
      );
      await Promise.all(smsPromises);

      showAlert('success', `${recipients.length}명에게 문자가 성공적으로 발송되었습니다.`);
    } catch (error) {
      console.error("Error sending bulk SMS:", error);
      showAlert('error', '대량 발송 중 오류가 발생했습니다.');
    }
    setIsLoading(false);
  };

  const handleTestSend = async (countryCode, messageContent) => {
    setIsLoading(true);
    try {
      const testPhoneKeys = [`test_phone_${countryCode}_t1`, `test_phone_${countryCode}_t2`, `test_phone_${countryCode}_t3`];
      
      const settingsPromises = testPhoneKeys.map(key => Setting.filter({ key }));
      const settingsResults = await Promise.all(settingsPromises);

      const testNumbers = [
        { id: 't1', number: settingsResults[0].length > 0 ? settingsResults[0][0].value : null },
        { id: 't2', number: settingsResults[1].length > 0 ? settingsResults[1][0].value : null },
        { id: 't3', number: settingsResults[2].length > 0 ? settingsResults[2][0].value : null }
      ].filter(test => test.number);

      if (testNumbers.length === 0) {
        showAlert('error', t.noTestNumber);
        setIsLoading(false);
        return;
      }
      
      const country = countryPrices.find(c => c.country_code === countryCode);
       if (!country) {
        showAlert('error', '선택된 국가의 가격 정보를 찾을 수 없습니다.');
        setIsLoading(false);
        return;
      }
      
      const priceMultiplier = getFinalMultiplier(user, countryCode);
      const messageInfo = calculateMessageInfo(messageContent);
      const cost = country.cost * priceMultiplier * messageInfo.segments;

      const testPromises = testNumbers.map(async (testNumber) => {
        const testUuid = `test_${testNumber.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await TestLog.create({
          recipient_number: testNumber.number,
          send_time: new Date(),
          status: 'pending',
          cost: cost,
          country_code: countryCode,
          test_uuid: testUuid,
          sms_message_id: `test_${testUuid}`,
          test_type: testNumber.id
        });

        // 40초 후 타임아웃 처리
        setTimeout(async () => {
          try {
            const logs = await TestLog.filter({ test_uuid: testUuid, status: 'pending' });
            if (logs.length > 0) {
              await TestLog.update(logs[0].id, { status: 'timed_out' });
              loadData(); // 데이터 새로고침
            }
          } catch (error) {
            console.error("Error updating timeout:", error);
          }
        }, 40000);
      });

      await Promise.all(testPromises);
      showAlert('success', t.testSendSuccess);
      await loadData();
    } catch (error) {
      console.error("Error sending test SMS:", error);
      showAlert('error', '테스트 발송 중 오류가 발생했습니다.');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="zh">中文</option>
        </select>
      </div>
      
      {alert && (
        <div className={`p-4 rounded-lg border ${alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
          <div className="flex items-center gap-2">
            {alert.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <Check className="h-5 w-5" />}
            <span>{alert.message}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BulkSendForm
          onSubmit={handleBulkSend}
          onTestSend={handleTestSend}
          contacts={contacts}
          countryCodes={countryPrices}
          isLoading={isLoading}
          user={user}
          language={language}
        />
      </div>

      <TestLogTable testLogs={testLogs} language={language} />
    </div>
  );
}
