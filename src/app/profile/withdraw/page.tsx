
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Wallet, Banknote, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CoinDisplay } from '@/components/coin-display';

export default function WithdrawCoinsPage() {
  const { toast } = useToast();
  // In a real app, this would come from a global state/context or API
  const [currentCoins, setCurrentCoins] = useState(12500); 
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Placeholder bank details - in a real app, these would be securely fetched
  const userIban = "DE89 3704 0044 0532 0130 00";
  const userBic = "COBADEFFXXX";

  const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and ensure it's not negative
    if (/^\d*$/.test(value)) {
      setWithdrawAmount(value);
      if (error) setError(null); // Clear error when user types
    }
  };

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount, 10);

    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid withdrawal amount.");
      toast({
        title: "Invalid Amount",
        description: "Please enter a positive number for withdrawal.",
        variant: "destructive",
      });
      return;
    }

    if (amount > currentCoins) {
      setError("Insufficient coins for this withdrawal.");
      toast({
        title: "Insufficient Coins",
        description: `You only have ${currentCoins.toLocaleString()} coins.`,
        variant: "destructive",
      });
      return;
    }

    // Simulate withdrawal
    setCurrentCoins(prevCoins => prevCoins - amount);
    setWithdrawAmount(''); // Reset input field
    setError(null);
    
    toast({
      title: "Withdrawal Processed (Simulated)",
      description: `${amount.toLocaleString()} coins have been (simulated) scheduled for withdrawal to your account.`,
    });
  };
  
  // Effect to prevent hydration errors for currentCoins if it were dynamic
  const [clientCurrentCoins, setClientCurrentCoins] = useState<number | null>(null);
  useEffect(() => {
    setClientCurrentCoins(currentCoins);
  }, [currentCoins]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
      <Card className="w-full max-w-lg shadow-xl rounded-xl bg-card text-card-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold text-primary flex items-center">
              <Banknote className="mr-3 h-8 w-8" />
              Withdraw Coins
            </CardTitle>
            <Button asChild variant="outline" size="sm" className="text-foreground hover:bg-muted hover:text-muted-foreground">
              <Link href="/profile">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Link>
            </Button>
          </div>
          <CardDescription className="text-muted-foreground pt-2">
            Simulate withdrawing your in-game coins. In a real application, this would involve secure transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col items-center space-y-2 p-4 bg-muted/30 rounded-lg">
            <Label className="text-sm font-medium text-card-foreground">Your Current Coin Balance:</Label>
             {clientCurrentCoins !== null ? (
              <CoinDisplay amount={clientCurrentCoins} className="text-2xl bg-transparent shadow-none p-0" />
            ) : (
              <p className="text-2xl font-bold text-accent">Loading balance...</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="withdrawAmount" className="text-sm font-medium text-card-foreground">Amount to Withdraw</Label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="withdrawAmount"
                type="text" // Use text to allow custom validation for numbers
                inputMode="numeric" // Hint for numeric keyboard on mobile
                pattern="[0-9]*"    // Pattern for numeric input
                value={withdrawAmount}
                onChange={handleWithdrawAmountChange}
                placeholder="e.g., 500"
                className="bg-input text-foreground pl-10 text-lg"
                aria-describedby="error-message"
              />
            </div>
            {error && (
              <p id="error-message" className="text-sm text-destructive flex items-center mt-1">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {error}
              </p>
            )}
          </div>

          <div className="space-y-3 p-4 border border-border rounded-lg bg-secondary/20">
            <h4 className="text-md font-semibold text-card-foreground">Withdrawal Destination (Simulated Confirmation)</h4>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-card-foreground">IBAN:</span> {userIban}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-card-foreground">BIC/SWIFT:</span> {userBic}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Please ensure these details are correct in your profile settings for actual withdrawals.
            </p>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
           <Button asChild variant="outline" className="w-full sm:w-auto text-foreground hover:bg-muted hover:text-muted-foreground">
            <Link href="/profile">
              Cancel
            </Link>
          </Button>
          <Button 
            onClick={handleWithdraw} 
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={!withdrawAmount || parseInt(withdrawAmount, 10) <= 0 || parseInt(withdrawAmount, 10) > currentCoins}
          >
            <Banknote className="mr-2 h-5 w-5" />
            Withdraw (Simulated)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
