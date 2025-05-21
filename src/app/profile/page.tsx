
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowLeft, LogOut, UserCircle, Home, CreditCard, Loader2, AlertTriangle, Settings } from "lucide-react";
import { useAuth, type UserProfile as AuthUserProfile } from '@/contexts/auth-context';
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Timestamp } from 'firebase/firestore';


export default function ProfilePage() {
  const { user, userProfile, signOut, loading: authLoading, error: authContextError } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<AuthUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSpecificError, setPageSpecificError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true); 
    setPageSpecificError(null);

    if (!authLoading) { 
        if (user) { 
            if (userProfile) { 
                setProfileData(userProfile);
            } else { 
                setProfileData(null);
                let detailedError = "Your profile data could not be loaded. Please try again later.";
                if (authContextError) {
                    if (authContextError.toLowerCase().includes("offline") || authContextError.toLowerCase().includes("network") || authContextError.toLowerCase().includes("failed to get document")) {
                        detailedError = `Failed to connect to the database. Please check your Firebase configuration, security rules, and internet connection. Details: ${authContextError}`;
                    } else {
                        detailedError = authContextError;
                    }
                }
                setPageSpecificError(detailedError);
            }
        } else { 
            router.push('/auth');
        }
        setIsLoading(false); 
    }
}, [user, userProfile, authLoading, authContextError, router]);


  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
        <p>You need to be logged in to view this page.</p>
        <Button asChild className="mt-4">
          <Link href="/auth">Login</Link>
        </Button>
      </div>
    );
  }
  
  if (pageSpecificError && !profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
        <Card className="w-full max-w-md p-6 shadow-xl rounded-xl bg-card text-card-foreground">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-2xl text-destructive mb-2">Profile Error</CardTitle>
            <CardDescription className="text-muted-foreground mb-4">
              Could not load your profile information.
            </CardDescription>
            <p className="text-sm text-destructive-foreground bg-destructive/20 p-3 rounded-md mb-6">{pageSpecificError}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Homepage
            </Button>
             <Button variant="outline" onClick={signOut} className="w-full mt-2 text-foreground hover:bg-muted hover:text-muted-foreground">
              Logout and Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Preparing profile data...</p>
       </div>
    );
  }
  
  const getDisplayDate = (dateValue: Timestamp | Date | undefined): string => {
    if (!dateValue) return "Not available";
    if (dateValue instanceof Timestamp) {
      return dateValue.toDate().toLocaleDateString();
    }
    if (dateValue instanceof Date) { // If it's already a Date object
      return dateValue.toLocaleDateString();
    }
    // Fallback for unexpected types, though UserProfile ensures it's Timestamp | Date
    return "Invalid date";
  };

  const joinDate = getDisplayDate(profileData.createdAt);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
      <Card className="w-full max-w-lg shadow-xl rounded-xl bg-card text-card-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold text-primary">User Profile</CardTitle>
            <Button asChild variant="outline" size="sm" className="text-foreground hover:bg-muted hover:text-muted-foreground">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Game
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center space-x-4"> 
              <Avatar className="h-12 w-12 border-2 border-accent">
                <AvatarImage src={profileData.avatarUrl || `https://placehold.co/64x64.png?text=${(profileData.username || 'P').charAt(0).toUpperCase()}`} alt={profileData.username || 'User Avatar'} data-ai-hint="user avatar" />
                <AvatarFallback className="bg-muted text-muted-foreground text-xl">
                  {(profileData.username || "P").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">{profileData.username}</h2>
                <p className="text-xs text-muted-foreground">{profileData.email}</p>
                <p className="text-xs text-muted-foreground">Joined: {joinDate}</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="bg-background text-foreground hover:bg-muted hover:text-muted-foreground flex-shrink-0">
              <Link href="/profile/edit">
                Edit
              </Link>
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-card-foreground border-b border-border pb-2">Account Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <UserCircle className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground">Full Name:</p>
                  <p className="font-medium text-card-foreground">{profileData.fullName || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Home className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground">Address:</p>
                  <p className="font-medium text-card-foreground">{profileData.address || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground">IBAN (for withdrawal):</p>
                  <p className="font-medium text-card-foreground">{profileData.iban || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground">BIC/SWIFT (for withdrawal):</p>
                  <p className="font-medium text-card-foreground">{profileData.bic || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-card-foreground border-b border-border pb-2">Game Statistics (Simulated)</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Games Played:</p>
                <p className="font-semibold text-lg text-card-foreground">?</p>
              </div>
              <div>
                <p className="text-muted-foreground">Wins:</p>
                <p className="font-semibold text-lg text-green-400">?</p>
              </div>
              <div>
                <p className="text-muted-foreground">Losses:</p>
                <p className="font-semibold text-lg text-red-400">?</p>
              </div>
              <div>
                <p className="text-muted-foreground">Draws:</p>
                <p className="font-semibold text-lg text-yellow-400">?</p>
              </div>
              <div>
                <p className="text-muted-foreground">Win Rate:</p>
                <p className="font-semibold text-lg text-card-foreground">?</p>
              </div>
              <div>
                <p className="text-muted-foreground">Coins Won:</p>
                <p className="font-semibold text-lg text-accent">{profileData.coins.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
             <h3 className="text-xl font-semibold text-card-foreground border-b border-border pb-2">Achievements (Simulated)</h3>
             <div className="flex flex-wrap gap-2">
                <span className="bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full">Rookie Rocker</span>
                <span className="bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full">Paper Pro</span>
                <span className="bg-muted text-muted-foreground text-xs font-semibold px-2 py-1 rounded-full">High Roller</span>
             </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Link href="/profile/withdraw">Withdraw Coins</Link>
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={signOut}
              disabled={authLoading}
            >
              {authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


    