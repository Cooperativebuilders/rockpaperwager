
import GameInterface from '@/components/game-interface';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground p-4 sm:p-8">
      <header className="w-full max-w-2xl mb-8 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-primary tracking-tight">
          Rock Paper Wager
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Create a lobby, invite friends, or join a random game. Wager your coins and prove your skill!
        </p>
      </header>
      <main className="w-full max-w-lg">
        <GameInterface />
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Rock Paper Wager. All rights reserved.</p>
        <p>Built with Next.js & ShadCN UI.</p>
      </footer>
    </div>
  );
}
