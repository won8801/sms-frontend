
import React, { useState, useEffect } from "react";
import { Setting } from "@/api/entities";
import { Announcement } from "@/api/entities";
import { CountryPrice } from "@/api/entities"; // Import CountryPrice
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Phone, Bell, Save, Plus, Globe } from "lucide-react"; // Import Globe icon
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnnouncementList from "../components/admin/AnnouncementList";
import AnnouncementForm from "../components/admin/AnnouncementForm";
import CountryPriceManager from "../components/admin/CountryPriceManager"; // Import component

export default function AdminSettings() {
  const [selectedCountryForTest, setSelectedCountryForTest] = useState('');
  const [testNumbers, setTestNumbers] = useState({
    t1: '',
    t2: '',
    t3: ''
  });
  const [announcements, setAnnouncements] = useState([]);
  const [isAnnouncementFormOpen, setIsAnnouncementFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [countryPrices, setCountryPrices] = useState([]); // Add state for country prices
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [announcementsData, countryPricesData] = await Promise.all([
        Announcement.list("-priority"),
        CountryPrice.list()
      ]);
      setAnnouncements(announcementsData);
      setCountryPrices(countryPricesData);
      if (countryPricesData.length > 0) {
        setSelectedCountryForTest(countryPricesData[0].country_code);
        loadTestNumbersForCountry(countryPricesData[0].country_code);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const loadTestNumbersForCountry = async (countryCode) => {
    if (!countryCode) return;
    try {
      const [t1Setting, t2Setting, t3Setting] = await Promise.all([
        Setting.filter({ key: `test_phone_${countryCode}_t1` }),
        Setting.filter({ key: `test_phone_${countryCode}_t2` }),
        Setting.filter({ key: `test_phone_${countryCode}_t3` })
      ]);
      setTestNumbers({
        t1: t1Setting.length > 0 ? t1Setting[0].value : '',
        t2: t2Setting.length > 0 ? t2Setting[0].value : '',
        t3: t3Setting.length > 0 ? t3Setting[0].value : ''
      });
    } catch (error) {
      console.error(`Error loading test numbers for ${countryCode}:`, error);
    }
  };

  useEffect(() => {
    if (selectedCountryForTest) {
      loadTestNumbersForCountry(selectedCountryForTest);
    }
  }, [selectedCountryForTest]);

  // loadAnnouncements and loadCountryPrices are kept as they are used by other components/handlers
  // and loadInitialData only covers initial fetch
  const loadAnnouncements = async () => {
    try {
      const data = await Announcement.list("-priority");
      setAnnouncements(data);
    } catch (error) {
      console.error("Error loading announcements:", error);
    }
  };

  const loadCountryPrices = async () => {
    try {
      const data = await CountryPrice.list();
      setCountryPrices(data);
    } catch (error) {
      console.error("Error loading country prices:", error);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleTestNumberSave = async () => {
    if (!selectedCountryForTest) return; // Prevent saving if no country is selected
    setIsLoading(true);
    try {
      const keys = ['t1', 't2', 't3'];
      for (const key of keys) {
        const settingKey = `test_phone_${selectedCountryForTest}_${key}`;
        const existingSettings = await Setting.filter({ key: settingKey });

        // Delete existing setting if it exists
        for (const setting of existingSettings) {
          await Setting.delete(setting.id);
        }

        // Create new setting if value is provided
        if (testNumbers[key].trim()) {
          await Setting.create({ key: settingKey, value: testNumbers[key].trim() });
        }
      }
      showAlert('success', `${selectedCountryForTest} 국가의 테스트 번호가 성공적으로 저장되었습니다.`);
    } catch (error) {
      console.error("Error saving test numbers:", error);
      showAlert('error', '테스트 번호 저장 중 오류가 발생했습니다.');
    }
    setIsLoading(false);
  };

  const handleAnnouncementSubmit = async (formData) => {
    try {
      if (editingAnnouncement) {
        await Announcement.update(editingAnnouncement.id, formData);
        showAlert('success', '공지사항이 수정되었습니다.');
      } else {
        await Announcement.create(formData);
        showAlert('success', '공지사항이 생성되었습니다.');
      }
      await loadAnnouncements();
      closeAnnouncementForm();
    } catch (error) {
      console.error("Error saving announcement:", error);
      showAlert('error', '공지사항 저장 중 오류가 발생했습니다.');
    }
  };

  const handleAnnouncementEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setIsAnnouncementFormOpen(true);
  };

  const handleAnnouncementDelete = async (announcementId) => {
    if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      try {
        await Announcement.delete(announcementId);
        await loadAnnouncements();
        showAlert('success', '공지사항이 삭제되었습니다.');
      } catch (error) {
        console.error("Error deleting announcement:", error);
        showAlert('error', '공지사항 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleAnnouncementToggle = async (announcement) => {
    try {
      await Announcement.update(announcement.id, { is_active: !announcement.is_active });
      await loadAnnouncements();
      showAlert('success', `공지사항이 ${!announcement.is_active ? '활성화' : '비활성화'}되었습니다.`);
    } catch (error) {
      console.error("Error toggling announcement:", error);
      showAlert('error', '공지사항 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const closeAnnouncementForm = () => {
    setIsAnnouncementFormOpen(false);
    setEditingAnnouncement(null);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">시스템 설정</h1>
        <p className="text-gray-600">SMS Pro 시스템의 전반적인 설정을 관리합니다</p>
      </div>

      {alert && (
        <Alert>
          <AlertDescription className={alert.type === 'error' ? 'text-red-600' : 'text-green-600'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      {/* 국가별 테스트 번호 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            국가별 테스트 발송 번호 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-w-xs">
            <Label htmlFor="country-select">국가 선택</Label>
            <Select onValueChange={setSelectedCountryForTest} value={selectedCountryForTest}>
              <SelectTrigger id="country-select">
                <SelectValue placeholder="국가를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {countryPrices.map(c => (
                  <SelectItem key={c.country_code} value={c.country_code}>
                    {c.country_name} ({c.country_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="test-t1">{selectedCountryForTest ? `${selectedCountryForTest} ` : ''}T1 테스트 번호</Label>
              <Input
                id="test-t1"
                value={testNumbers.t1}
                onChange={(e) => setTestNumbers({...testNumbers, t1: e.target.value})}
                placeholder="예: 821012345678"
                className="mt-1"
                disabled={!selectedCountryForTest}
              />
            </div>
            <div>
              <Label htmlFor="test-t2">{selectedCountryForTest ? `${selectedCountryForTest} ` : ''}T2 테스트 번호</Label>
              <Input
                id="test-t2"
                value={testNumbers.t2}
                onChange={(e) => setTestNumbers({...testNumbers, t2: e.target.value})}
                placeholder="예: 821098765432"
                className="mt-1"
                disabled={!selectedCountryForTest}
              />
            </div>
            <div>
              <Label htmlFor="test-t3">{selectedCountryForTest ? `${selectedCountryForTest} ` : ''}T3 테스트 번호</Label>
              <Input
                id="test-t3"
                value={testNumbers.t3}
                onChange={(e) => setTestNumbers({...testNumbers, t3: e.target.value})}
                placeholder="예: 821011112222"
                className="mt-1"
                disabled={!selectedCountryForTest}
              />
            </div>
          </div>
          <Button
            onClick={handleTestNumberSave}
            disabled={isLoading || !selectedCountryForTest}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? '저장 중...' : '테스트 번호 저장'}
          </Button>
        </CardContent>
      </Card>

      {/* 국가별 가격 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-600" />
            국가별 발송 단가 관리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CountryPriceManager countryPrices={countryPrices} onPricesUpdate={loadCountryPrices} />
        </CardContent>
      </Card>

      {/* 공지사항 관리 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              공지사항 관리
            </CardTitle>
            <Button
              onClick={() => setIsAnnouncementFormOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 공지사항 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AnnouncementList
            announcements={announcements}
            onEdit={handleAnnouncementEdit}
            onDelete={handleAnnouncementDelete}
            onToggle={handleAnnouncementToggle}
          />
        </CardContent>
      </Card>

      <AnnouncementForm
        isOpen={isAnnouncementFormOpen}
        onClose={closeAnnouncementForm}
        onSubmit={handleAnnouncementSubmit}
        announcement={editingAnnouncement}
      />
    </div>
  );
}
