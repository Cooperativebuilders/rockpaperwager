
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface TopUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPurchase: (amount: number) => void;
}

export function TopUpDialog({ isOpen, onClose, onConfirmPurchase }: TopUpDialogProps) {
  const [selectedAmount, setSelectedAmount] = useState(100);

  const handleConfirm = () => {
    onConfirmPurchase(selectedAmount);
    onClose(); // Ensure dialog closes after confirmation
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Purchase More Coins?</AlertDialogTitle>
          <AlertDialogDescription>
            Select the amount of coins you'd like to (simulated) purchase.
            In a real application, this screen would connect to the Apple App Store or Google Play Store for in-app purchases.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="coin-slider" className="text-sm font-medium">
              Amount:
            </Label>
            <span className="text-lg font-semibold text-primary">{selectedAmount.toLocaleString()} Coins</span>
          </div>
          <Slider
            id="coin-slider"
            defaultValue={[100]}
            min={100}
            max={10000}
            step={100}
            onValueChange={(value) => setSelectedAmount(value[0])}
            aria-label="Coin purchase amount slider"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Confirm Purchase
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
