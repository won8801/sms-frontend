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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExtractDataFromUploadedFile, UploadFile } from "@/api/integrations";

export default function BulkContactUploadDialog({ isOpen, onClose, onSubmit }) {
  const [uploadMethod, setUploadMethod] = useState('paste');
  const [pasteData, setPasteData] = useState('');
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [error, setError] = useState('');

  const handlePasteSubmit = () => {
    if (!pasteData.trim()) return;
    
    const lines = pasteData.trim().split('\n');
    const contacts = [];
    
    lines.forEach((line, index) => {
      const parts = line.split('\t').map(part => part.trim());
      if (parts.length >= 2) {
        contacts.push({
          name: parts[0] || `Contact ${index + 1}`,
          phone_number: parts[1],
          country_code: parts[2] || 'KR',
          memo: parts[3] || '',
          group_tags: parts[4] ? parts[4].split(';').map(tag => tag.trim()) : []
        });
      }
    });
    
    if (contacts.length > 0) {
      setPreviewData(contacts);
    } else {
      setError('올바른 형식의 데이터를 입력해주세요.');
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const { file_url } = await UploadFile({ file });
      
      const schema = {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            phone_number: { type: "string" },
            country_code: { type: "string" },
            memo: { type: "string" },
            group_tags: { type: "string" }
          },
          required: ["name", "phone_number"]
        }
      };
      
      const result = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: schema
      });
      
      if (result.status === 'success' && result.output) {
        const contacts = result.output.map(contact => ({
          ...contact,
          country_code: contact.country_code || 'KR',
          memo: contact.memo || '',
          group_tags: contact.group_tags ? contact.group_tags.split(';').map(tag => tag.trim()) : []
        }));
        setPreviewData(contacts);
      } else {
        setError(result.details || '파일 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      setError('파일 업로드 중 오류가 발생했습니다.');
    }
    
    setIsProcessing(false);
  };

  const handleFinalSubmit = async () => {
    if (previewData.length === 0) return;
    
    try {
      await onSubmit(previewData);
      handleClose();
    } catch (error) {
      setError('연락처 저장 중 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    setPasteData('');
    setFile(null);
    setPreviewData([]);
    setError('');
    setUploadMethod('paste');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>연락처 대량 추가</DialogTitle>
        </DialogHeader>

        {previewData.length === 0 ? (
          <Tabs value={uploadMethod} onValueChange={setUploadMethod}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">직접 입력</TabsTrigger>
              <TabsTrigger value="file">파일 업로드</TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4">
              <div>
                <Label>연락처 데이터</Label>
                <p className="text-sm text-gray-600 mb-2">
                  탭으로 구분하여 입력: 이름 | 전화번호 | 국가코드 | 메모 | 그룹태그(;로 구분)
                </p>
                <Textarea
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                  placeholder="홍길동	821012345678	KR	고객	VIP;마케팅
김철수	821098765432	KR	직원	내부"
                  className="min-h-48 font-mono text-sm"
                />
              </div>
              <Button onClick={handlePasteSubmit} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                데이터 미리보기
              </Button>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div>
                <Label>파일 선택</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Excel(.xlsx), CSV 파일을 업로드하세요
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <Button 
                onClick={handleFileUpload} 
                disabled={!file || isProcessing}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isProcessing ? '처리 중...' : '파일 업로드 및 분석'}
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium">미리보기: {previewData.length}개 연락처</span>
            </div>
            
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">이름</th>
                    <th className="p-2 text-left">전화번호</th>
                    <th className="p-2 text-left">국가</th>
                    <th className="p-2 text-left">메모</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 10).map((contact, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{contact.name}</td>
                      <td className="p-2">{contact.phone_number}</td>
                      <td className="p-2">{contact.country_code}</td>
                      <td className="p-2">{contact.memo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 10 && (
                <p className="p-2 text-center text-gray-500">
                  ... 외 {previewData.length - 10}개 더
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>
          {previewData.length > 0 ? (
            <Button onClick={handleFinalSubmit}>
              {previewData.length}개 연락처 저장
            </Button>
          ) : (
            <Button onClick={() => handleClose()} disabled>
              저장
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}