
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, LogIn, UserPlus } from 'lucide-react'; // Removed Home icon
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

// A simple inline SVG for Google G icon
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="18" height="18" className="mr-2">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
    <path fill="none" d="M0 0h48v48H0z"></path>
  </svg>
);


export default function AuthPage() {
  const { toast } = useToast();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    toast({
      title: "Login Attempt (Simulated)",
      description: `Would log in with email: ${loginEmail}`,
    });
    // In a real app, redirect to '/' or dashboard after successful login
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Sign Up Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    // Simulate sign up
    toast({
      title: "Sign Up Attempt (Simulated)",
      description: `Would sign up user: ${signupUsername} with email: ${signupEmail}`,
    });
    // In a real app, redirect to '/' or dashboard after successful sign up
  };

  const handleGoogleSignIn = () => {
    // Simulate Google Sign-In
    toast({
      title: "Google Sign-In (Simulated)",
      description: "Google Sign-In process would be initiated here.",
    });
    // In a real app, redirect to '/' or dashboard after successful Google sign-in
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
      <Card className="w-full max-w-md shadow-xl rounded-xl bg-card text-card-foreground relative">
        {/* "Back to Game" button removed from here */}
        
        <Tabs defaultValue="login" className="w-full">
          <div className="px-4 pt-6 sm:px-6"> {/* Adjusted pt if Back to Game button was taking space */}
            <TabsList className="grid w-full grid-cols-2 rounded-lg h-14">
              <TabsTrigger value="login" className="text-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full rounded-l-lg">
                <LogIn className="mr-2 h-5 w-5" /> Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full rounded-r-lg">
                <UserPlus className="mr-2 h-5 w-5" /> Sign Up
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex flex-col items-center px-6 py-6">
            <Image
                src="/logo.png"
                alt="Rock Paper Wager Logo"
                width={728}
                height={1000}
                className="h-24 w-auto object-contain"
                priority
                data-ai-hint="company logo"
            />
          </div>
          
          <TabsContent value="login">
            <CardContent className="space-y-6 p-6 pt-0">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-sm font-medium text-card-foreground">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="bg-input text-foreground pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-sm font-medium text-card-foreground">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="bg-input text-foreground pl-10"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3">
                  Login
                </Button>
              </form>
              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  OR
                </span>
              </div>
              <Button variant="outline" onClick={handleGoogleSignIn} className="w-full text-card-foreground hover:bg-muted hover:text-muted-foreground">
                <GoogleIcon />
                Sign in with Google
              </Button>
            </CardContent>
          </TabsContent>

          <TabsContent value="signup">
            <CardContent className="space-y-6 p-6 pt-0">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-username" className="text-sm font-medium text-card-foreground">Username</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Player123"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      required
                      className="bg-input text-foreground pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-email" className="text-sm font-medium text-card-foreground">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="bg-input text-foreground pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-password" className="text-sm font-medium text-card-foreground">Password</Label>
                   <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      className="bg-input text-foreground pl-10"
                    />
                  </div>
                </div>
                 <div>
                  <Label htmlFor="signup-confirm-password" className="text-sm font-medium text-card-foreground">Confirm Password</Label>
                   <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                      className="bg-input text-foreground pl-10"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3">
                  Sign Up
                </Button>
              </form>
              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  OR
                </span>
              </div>
              <Button variant="outline" onClick={handleGoogleSignIn} className="w-full text-card-foreground hover:bg-muted hover:text-muted-foreground">
                 <GoogleIcon />
                Sign in with Google
              </Button>
            </CardContent>
          </TabsContent>
        </Tabs>
        <CardFooter className="pt-6 flex justify-center">
           <p className="text-xs text-muted-foreground">
            By signing up, you agree to our (simulated) Terms of Service.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
