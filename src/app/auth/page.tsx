
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, LogIn, UserPlus, Home } from 'lucide-react';
import Image from 'next/image';

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
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
      <div className="absolute top-8 left-8">
        <Button asChild variant="outline" className="text-foreground hover:bg-muted hover:text-muted-foreground">
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            Back to Game
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col items-center mb-8">
        <Image
            src="/logo.png"
            alt="Rock Paper Wager Logo"
            width={728}
            height={1000}
            className="h-24 w-auto object-contain mb-4"
            priority
            data-ai-hint="company logo"
        />
        <h1 className="text-4xl font-bold text-primary">Rock Paper Wager</h1>
        <p className="text-muted-foreground">Join the fun or log in to your account.</p>
      </div>

      <Card className="w-full max-w-md shadow-xl rounded-xl bg-card text-card-foreground">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="p-0">
            <TabsList className="grid w-full grid-cols-2 rounded-t-xl rounded-b-none h-14">
              <TabsTrigger value="login" className="text-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full rounded-tl-xl">
                <LogIn className="mr-2 h-5 w-5" /> Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full rounded-tr-xl">
                <UserPlus className="mr-2 h-5 w-5" /> Sign Up
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <TabsContent value="login">
            <CardContent className="space-y-6 p-6">
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
            </CardContent>
          </TabsContent>

          <TabsContent value="signup">
            <CardContent className="space-y-6 p-6">
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

