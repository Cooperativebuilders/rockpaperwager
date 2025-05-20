
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
import { Button } from "@/components/ui/button"; // For styling AlertDialogAction if needed
import { Loader2 } from "lucide-react";

interface TopUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPurchase: (amount: number) => Promise<void> | void; // Can be async
}

export function TopUpDialog({ isOpen, onClose, onConfirmPurchase }: TopUpDialogProps) {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleConfirm = async () => {
    setIsPurchasing(true);
    try {
      await onConfirmPurchase(selectedAmount);
    } catch (e) {
      // Error should be handled by onConfirmPurchase (e.g. toast)
      console.error("Purchase failed in dialog:", e);
    } finally {
      setIsPurchasing(false);
      onClose(); 
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open && !isPurchasing) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Purchase More Coins?</AlertDialogTitle>
          <AlertDialogDescription>
            Select the amount of coins you'd like to purchase.
            This is a simulation. In a real application, this screen would connect to payment services.
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
            value={[selectedAmount]} // Controlled component
            min={100}
            max={10000}
            step={100}
            onValueChange={(value) => setSelectedAmount(value[0])}
            aria-label="Coin purchase amount slider"
            disabled={isPurchasing}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isPurchasing}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPurchasing}>
            {isPurchasing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isPurchasing ? "Processing..." : "Confirm Purchase"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
