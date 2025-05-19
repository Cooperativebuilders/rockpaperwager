
"use client";

import { Coins } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react'; // Changed from HTMLAttributes
import { cn } from '@/lib/utils';

interface CoinDisplayProps extends ButtonHTMLAttributes<HTMLButtonElement> { // Changed from HTMLDivElement
  amount: number;
  onPurchaseClick?: () => void; // New prop to handle click for purchasing
}

export function CoinDisplay({ amount, onPurchaseClick, className, ...props }: CoinDisplayProps) {
  return (
    <button // Changed from div to button
      type="button" // Added type for button
      onClick={onPurchaseClick}
      className={cn(
        "flex items-center justify-center font-semibold text-lg bg-muted/50 text-muted-foreground p-2 px-4 rounded-lg shadow",
        "hover:bg-muted/70 active:bg-muted/80 transition-colors", // Added interactive styles
        onPurchaseClick ? "cursor-pointer" : "cursor-default", // Make cursor pointer if clickable
        className
      )}
      disabled={!onPurchaseClick} // Disable if no click handler is provided
      {...props}
      aria-label={onPurchaseClick ? `Current coin balance: ${amount}. Click to simulate purchasing more coins.` : `Current coin balance: ${amount}`}
    >
      <Coins className="w-6 h-6 mr-2 text-accent" />
      <span>{amount.toLocaleString()}</span>
    </button>
  );
}
