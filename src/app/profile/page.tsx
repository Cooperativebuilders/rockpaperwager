
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowLeft, LogOut, UserCircle, Home, CreditCard, Loader2 } from "lucide-react";
import { useAuth, type UserProfile as AuthUserProfile } from '@/contexts/auth-context'; // Import useAuth
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";


export default function ProfilePage() {
  const { user, userProfile, signOut, loading: authLoading, fetchUserProfile: fetchAuthUserProfile } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<AuthUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth'); // Redirect if not authenticated
    }
  }, [user, authLoading, router]);
  
  useEffect(() => {
    if (userProfile) {
      setProfileData(userProfile);
      setIsLoading(false);
    } else if (user && !userProfile && !authLoading) {
      // If userProfile is null in context but user exists, try fetching it.
      // This can happen on direct navigation to /profile if context hasn't fully populated.
      const loadProfile = async () => {
        setIsLoading(true);
        const fetched = await fetchAuthUserProfile(user.uid);
        if (fetched) {
          setProfileData(fetched);
        }
        setIsLoading(false);
      };
      loadProfile();
    } else if (!user && !authLoading) {
       setIsLoading(false); // Not logged in, nothing to load
    }
  }, [user, userProfile, authLoading, fetchAuthUserProfile]);


  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user || !profileData) {
     // Should be redirected by useEffect, but as a fallback:
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
        <p>You need to be logged in to view this page.</p>
        <Button asChild className="mt-4">
          <Link href="/auth">Login</Link>
        </Button>
      </div>
    );
  }
  
  // Simulated join date for display if not present
  const joinDate = profileData.createdAt?.toDate ? profileData.createdAt.toDate().toLocaleDateString() : "Not available";


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
          {/* User Info and Edit Button Section */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center space-x-4"> {/* Avatar and text details */}
              <Avatar className="h-16 w-16 border-2 border-accent">
                <AvatarImage src={profileData.avatarUrl || `https://placehold.co/128x128.png?text=${profileData.username.charAt(0).toUpperCase()}`} alt={profileData.username} data-ai-hint="user avatar" />
                <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                  {profileData.username.charAt(0).toUpperCase()}
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

          {/* Detailed User Information */}
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
                <p className="font-semibold text-lg text-card-foreground">150</p>
              </div>
              <div>
                <p className="text-muted-foreground">Wins:</p>
                <p className="font-semibold text-lg text-green-400">90</p>
              </div>
              <div>
                <p className="text-muted-foreground">Losses:</p>
                <p className="font-semibold text-lg text-red-400">55</p>
              </div>
              <div>
                <p className="text-muted-foreground">Draws:</p>
                <p className="font-semibold text-lg text-yellow-400">5</p>
              </div>
              <div>
                <p className="text-muted-foreground">Win Rate:</p>
                <p className="font-semibold text-lg text-card-foreground">60%</p>
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
          
          {/* Grouped Buttons: Withdraw and Logout */}
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
