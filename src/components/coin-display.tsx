"use client";

import { Coins } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CoinDisplayProps extends HTMLAttributes<HTMLDivElement> {
  amount: number;
}

export function CoinDisplay({ amount, className, ...props }: CoinDisplayProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center font-semibold text-lg bg-muted/50 text-muted-foreground p-2 px-4 rounded-lg shadow",
        className
      )}
      {...props}
      aria-label={`Current coin balance: ${amount}`}
    >
      <Coins className="w-6 h-6 mr-2 text-accent" />
      <span>{amount.toLocaleString()}</span>
    </div>
  );
}
