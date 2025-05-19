
"use client";

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

interface TopUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPurchase: () => void;
}

export function TopUpDialog({ isOpen, onClose, onConfirmPurchase }: TopUpDialogProps) {
  // We don't need to render anything if not open, as AlertDialog handles its own visibility via the `open` prop.
  // However, if AlertDialog didn't manage its own mounting/unmounting based on `open`,
  // returning null here would be a common pattern:
  // if (!isOpen) {
  //   return null;
  // }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Purchase More Coins?</AlertDialogTitle>
          <AlertDialogDescription>
            This is a simulation. Clicking &quot;Confirm Purchase&quot; will add 500 coins to your balance.
            In a real application, this screen would connect to the Apple App Store or Google Play Store for in-app purchases.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            onConfirmPurchase();
            onClose(); // Ensure dialog closes after confirmation
          }}>
            Confirm Purchase
          </AlertDialogAction>
        </AlertDialogFooter
