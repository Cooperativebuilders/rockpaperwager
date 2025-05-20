
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have Textarea for address
import { ArrowLeft, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EditProfilePage() {
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/128x128.png");
  const [username, setUsername] = useState("Player123");
  const [fullName, setFullName] = useState("John Doe"); // Simulated
  const [address, setAddress] = useState("123 Main St, Anytown, USA"); // Simulated
  const [iban, setIban] = useState("DE89370400440532013000"); // Simulated
  const [bic, setBic] = useState("COBADEFFXXX"); // Simulated

  const handleSaveChanges = () => {
    // In a real app, you would handle form submission and API calls here.
    toast({
      title: "Profile Update (Simulated)",
      description: "Your changes would be saved in a real application.",
    });
  };

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
              <AvatarImage src={avatarUrl} alt="User Avatar" data-ai-hint="user avatar" />
              <AvatarFallback className="bg-muted text-muted-foreground text-5xl">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="w-full sm:w-3/4">
              <Label htmlFor="avatarUrl" className="text-sm font-medium text-card-foreground">Avatar URL</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="bg-input text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">Enter a URL for your avatar image.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-card-foreground">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-input text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-card-foreground">Full Name <span className="text-xs text-muted-foreground">(Private)</span></Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-input text-foreground"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-sm font-medium text-card-foreground">Address <span className="text-xs text-muted-foreground">(Private)</span></Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="bg-input text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="iban" className="text-sm font-medium text-card-foreground">IBAN <span className="text-xs text-muted-foreground">(Private, for withdrawal)</span></Label>
              <Input
                id="iban"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="bg-input text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="bic" className="text-sm font-medium text-card-foreground">BIC/SWIFT <span className="text-xs text-muted-foreground">(Private, for withdrawal)</span></Label>
              <Input
                id="bic"
                value={bic}
                onChange={(e) => setBic(e.target.value)}
                className="bg-input text-foreground"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 pt-6">
           <Button asChild variant="outline" className="text-foreground hover:bg-muted hover:text-muted-foreground">
            <Link href="/profile">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
          <Button onClick={handleSaveChanges} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Save className="mr-2 h-4 w-4" />
            Save Changes (Simulated)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
