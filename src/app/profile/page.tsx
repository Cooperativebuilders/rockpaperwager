
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
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
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-accent">
              <AvatarImage src="https://placehold.co/128x128.png" alt="User Avatar" data-ai-hint="user avatar" />
              <AvatarFallback className="bg-muted text-muted-foreground text-4xl">P</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-semibold text-card-foreground">Player123</h2>
              <p className="text-md text-muted-foreground">player123@example.com (Simulated)</p>
              <p className="text-sm text-muted-foreground">Joined: January 1, 2024 (Simulated)</p>
            </div>
          </div>

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
                <p className="font-semibold text-lg text-accent">12,500</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
             <h3 className="text-xl font-semibold text-card-foreground border-b border-border pb-2">Achievements (Simulated)</h3>
             <div className="flex flex-wrap gap-2">
                <span className="bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full">Rookie Rocker</span>
                <span className="bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full">Paper Pro</span>
                <span className="bg-muted text-muted-foreground text-xs font-semibold px-2 py-1 rounded-full">High Roller</span>
             </div>
          </div>

          <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground mt-4">
            <Link href="/profile/withdraw">Withdraw Coins</Link>
          </Button>
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2">
            <Link href="/profile/edit">Edit Profile</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
