
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface BetSelectionDialogProps {
  isOpen: boolean;
  friendName: string | null;
  onClose: () => void;
  onConfirmBet: (betAmount: number) => void;
  currentCoins: number; // To disable buttons if bet > currentCoins
}

const BET_AMOUNTS = [10, 100, 1000];

export function BetSelectionDialog({
  isOpen,
  friendName,
  onClose,
  onConfirmBet,
  currentCoins,
}: BetSelectionDialogProps) {
  if (!isOpen || !friendName) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite {friendName} to Play</DialogTitle>
          <DialogDescription>
            Select the bet amount for your game with {friendName}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground text-center">Choose Bet Amount:</p>
          <div className="flex flex-col sm:flex-row sm:gap-4 items-center sm:justify-around">
            {BET_AMOUNTS.map((amount) => (
              <Button
                key={`invite-bet-${amount}`}
                onClick={() => onConfirmBet(amount)}
                className="rounded-full w-28 h-28 flex flex-col items-center justify-center p-3 text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transform transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={amount > currentCoins}
                aria-label={`Bet ${amount} coins`}
              >
                <Wallet className="mb-1 h-6 w-6" />
                Bet {amount}
              </Button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
