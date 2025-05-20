
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Wallet, Banknote, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CoinDisplay } from '@/components/coin-display';
import { useAuth, type UserProfile } from '@/contexts/auth-context';

export default function WithdrawCoinsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, userProfile, loading: authLoading, updateFirestoreProfile, fetchUserProfile } = useAuth();

  const [currentCoins, setCurrentCoins] = useState(0); 
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bankDetails, setBankDetails] = useState({ iban: "Not set", bic: "Not set" });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setIsLoading(true);
        const profileToLoad = userProfile || await fetchUserProfile(user.uid);
        if (profileToLoad) {
          setCurrentCoins(profileToLoad.coins);
          setBankDetails({
            iban: profileToLoad.iban || "Not set - please update in profile",
            bic: profileToLoad.bic || "Not set - please update in profile",
          });
        }
        setIsLoading(false);
      } else if (!authLoading) {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [user, userProfile, authLoading, fetchUserProfile]);


  const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setWithdrawAmount(value);
      if (error) setError(null);
    }
  };

  const handleWithdraw = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    const amount = parseInt(withdrawAmount, 10);

    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid withdrawal amount.");
      toast({ title: "Invalid Amount", description: "Please enter a positive number.", variant: "destructive" });
      return;
    }

    if (amount > currentCoins) {
      setError("Insufficient coins for this withdrawal.");
      toast({ title: "Insufficient Coins", description: `You only have ${currentCoins.toLocaleString()} coins.`, variant: "destructive" });
      return;
    }
    
    if(bankDetails.iban === "Not set - please update in profile" || bankDetails.bic === "Not set - please update in profile") {
      setError("Bank details missing. Please update your IBAN and BIC in your profile settings.");
      toast({ title: "Bank Details Missing", description: "Please update your IBAN and BIC in profile settings.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const newCoinBalance = currentCoins - amount;
      await updateFirestoreProfile(user.uid, { coins: newCoinBalance });
      setCurrentCoins(newCoinBalance);
      setWithdrawAmount('');
      toast({
        title: "Withdrawal Processed (Simulated)",
        description: `${amount.toLocaleString()} coins have been (simulated) scheduled for withdrawal.`,
      });
    } catch (err: any) {
      toast({ title: "Withdrawal Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Effect to prevent hydration errors for currentCoins if it were dynamic (still good practice)
  const [clientCurrentCoins, setClientCurrentCoins] = useState<number | null>(null);
  useEffect(() => {
    setClientCurrentCoins(currentCoins);
  }, [currentCoins]);


  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading withdrawal page...</p>
      </div>
    );
  }
  
  if (!user) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
        <p>You need to be logged in to withdraw coins.</p>
        <Button asChild className="mt-4">
          <Link href="/auth">Login</Link>
        </Button>
      </div>
    );
  }

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
            Withdraw your in-game coins. This will be sent to your registered bank account.
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
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={withdrawAmount}
                onChange={handleWithdrawAmountChange}
                placeholder="e.g., 500"
                className="bg-input text-foreground pl-10 text-lg"
                aria-describedby="error-message"
                disabled={isProcessing}
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
            <h4 className="text-md font-semibold text-card-foreground">Withdrawal Destination</h4>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-card-foreground">IBAN:</span> {bankDetails.iban}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-card-foreground">BIC/SWIFT:</span> {bankDetails.bic}
            </p>
            { (bankDetails.iban === "Not set - please update in profile" || bankDetails.bic === "Not set - please update in profile") &&
              <p className="text-xs text-amber-400 mt-2">
                Please ensure these details are correct in your <Link href="/profile/edit" className="underline hover:text-accent">profile settings</Link> for withdrawals.
              </p>
            }
          </div>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
           <Button asChild variant="outline" className="w-full sm:w-auto text-foreground hover:bg-muted hover:text-muted-foreground" disabled={isProcessing}>
            <Link href="/profile">
              Cancel
            </Link>
          </Button>
          <Button 
            onClick={handleWithdraw} 
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isProcessing || !withdrawAmount || parseInt(withdrawAmount, 10) <= 0 || parseInt(withdrawAmount, 10) > currentCoins || bankDetails.iban.startsWith("Not set") || bankDetails.bic.startsWith("Not set")}
          >
            {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Banknote className="mr-2 h-5 w-5" />}
            Withdraw
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
