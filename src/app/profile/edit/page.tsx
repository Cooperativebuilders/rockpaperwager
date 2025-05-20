
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, type UserProfile } from '@/contexts/auth-context';

export default function EditProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, userProfile, loading: authLoading, fetchUserProfile, updateFirestoreProfile } = useAuth();

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    avatarUrl: "",
    username: "",
    fullName: "",
    address: "",
    iban: "",
    bic: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setIsLoading(true);
        // Prefer userProfile from context if available, otherwise fetch
        const profileToLoad = userProfile || await fetchUserProfile(user.uid);
        if (profileToLoad) {
          setFormData({
            avatarUrl: profileToLoad.avatarUrl || "",
            username: profileToLoad.username || "",
            fullName: profileToLoad.fullName || "",
            address: profileToLoad.address || "",
            iban: profileToLoad.iban || "",
            bic: profileToLoad.bic || "",
          });
        }
        setIsLoading(false);
      } else if (!authLoading) {
        setIsLoading(false); // No user, not loading
      }
    };
    loadProfile();
  }, [user, userProfile, authLoading, fetchUserProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      // Ensure username is not empty, other fields can be empty
      const dataToSave: Partial<UserProfile> = {
        ...formData,
        username: formData.username || userProfile?.username || "User", // Fallback username
      };
      await updateFirestoreProfile(user.uid, dataToSave);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved.",
      });
      router.push('/profile');
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile editor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
        <p>You need to be logged in to edit this page.</p>
        <Button asChild className="mt-4">
          <Link href="/auth">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
      <Card className="w-full max-w-2xl shadow-xl rounded-xl bg-card text-card-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold text-primary">Edit Profile</CardTitle>
            <Button asChild variant="outline" size="sm" className="text-foreground hover:bg-muted hover:text-muted-foreground">
              <Link href="/profile">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32 border-4 border-accent">
              <AvatarImage src={formData.avatarUrl || `https://placehold.co/128x128.png?text=${(formData.username || 'U').charAt(0).toUpperCase()}`} alt="User Avatar" data-ai-hint="user avatar" />
              <AvatarFallback className="bg-muted text-muted-foreground text-5xl">
                {(formData.username || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="w-full sm:w-3/4">
              <Label htmlFor="avatarUrl" className="text-sm font-medium text-card-foreground">Avatar URL</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={formData.avatarUrl || ""}
                onChange={handleInputChange}
                placeholder="https://example.com/avatar.png"
                className="bg-input text-foreground"
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground mt-1">Enter a URL for your avatar image.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-card-foreground">Username</Label>
              <Input
                id="username"
                value={formData.username || ""}
                onChange={handleInputChange}
                className="bg-input text-foreground"
                disabled={isSaving}
                required
              />
            </div>
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-card-foreground">Full Name <span className="text-xs text-muted-foreground">(Private)</span></Label>
              <Input
                id="fullName"
                value={formData.fullName || ""}
                onChange={handleInputChange}
                className="bg-input text-foreground"
                disabled={isSaving}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-sm font-medium text-card-foreground">Address <span className="text-xs text-muted-foreground">(Private)</span></Label>
            <Textarea
              id="address"
              value={formData.address || ""}
              onChange={handleInputChange}
              rows={3}
              className="bg-input text-foreground"
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="iban" className="text-sm font-medium text-card-foreground">IBAN <span className="text-xs text-muted-foreground">(Private, for withdrawal)</span></Label>
              <Input
                id="iban"
                value={formData.iban || ""}
                onChange={handleInputChange}
                className="bg-input text-foreground"
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="bic" className="text-sm font-medium text-card-foreground">BIC/SWIFT <span className="text-xs text-muted-foreground">(Private, for withdrawal)</span></Label>
              <Input
                id="bic"
                value={formData.bic || ""}
                onChange={handleInputChange}
                className="bg-input text-foreground"
                disabled={isSaving}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 pt-6">
           <Button asChild variant="outline" className="text-foreground hover:bg-muted hover:text-muted-foreground" disabled={isSaving}>
            <Link href="/profile">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
          <Button onClick={handleSaveChanges} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSaving || !formData.username}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
