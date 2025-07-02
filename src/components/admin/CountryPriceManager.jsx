import React, { useState } from 'react';
import { CountryPrice } from '@/api/entities';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil } from 'lucide-react';

export default function CountryPriceManager({ countryPrices, onPricesUpdate }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [newCost, setNewCost] = useState(0);

  const handleEditClick = (price) => {
    setEditingPrice(price);
    setNewCost(price.cost);
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingPrice) return;
    try {
      await CountryPrice.update(editingPrice.id, { cost: parseFloat(newCost) });
      setIsEditDialogOpen(false);
      setEditingPrice(null);
      onPricesUpdate(); // Callback to refresh the list in the parent
    } catch (error) {
      console.error("Failed to update country price:", error);
      // You might want to show an alert to the user here
    }
  };

  return (
    <div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>국가</TableHead>
              <TableHead>국가 코드</TableHead>
              <TableHead>국가 번호</TableHead>
              <TableHead>세그먼트당 비용 (€)</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countryPrices.map((price) => (
              <TableRow key={price.id}>
                <TableCell className="font-medium">{price.country_name}</TableCell>
                <TableCell>{price.country_code}</TableCell>
                <TableCell>{price.country_prefix}</TableCell>
                <TableCell>{price.cost.toFixed(4)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(price)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPrice?.country_name} 가격 수정</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="cost-input" className="font-medium">새 비용 (€)</label>
            <Input
              id="cost-input"
              type="number"
              step="0.0001"
              value={newCost}
              onChange={(e) => setNewCost(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}