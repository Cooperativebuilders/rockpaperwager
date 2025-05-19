
"use client";

import { useState } from 'react';
import GameInterface from '@/components/game-interface';
import FriendManagement from '@/components/friend-management';
import { BetSelectionDialog } from '@/components/bet-selection-dialog'; // Import the new dialog

export interface LobbyConfig {
  friendName: string;
  betAmount: number;
  lobbyId: string;
}

export default function HomePage() {
  const [isBetSelectionDialogOpen, setIsBetSelectionDialogOpen] = useState(false);
  const [friendToInvite, setFriendToInvite] = useState<string | null>(null);
  const [lobbyConfigForGame, setLobbyConfigForGame] = useState<LobbyConfig | null>(null);
  
  // This state needs to be accessible for the BetSelectionDialog
  // Ideally, this would come from a global state or context, but for simplicity,
  // we'll assume GameInterface can provide its current coin count if needed,
  // or we pass a static/less dynamic value if GameInterface isn't mounted/ready.
  // For now, let's simulate it here. In a real app, this needs careful handling.
  // Let's assume for the dialog check, we primarily rely on GameInterface's internal coin check
  // before it attempts to join/create. The dialog can show disabled buttons as a UI hint.
  // We'll pass a 'dummy' or a more complex prop later if needed.
  // For now, let's retrieve it from GameInterface if possible, or simplify.
  // For this iteration, we'll add a coin prop to GameInterface to expose it.
  const [currentPlayerCoins, setCurrentPlayerCoins] = useState(1000); // Initial default

  const handleOpenBetDialog = (friendName: string) => {
    setFriendToInvite(friendName);
    setIsBetSelectionDialogOpen(true);
  };

  const handleCloseBetDialog = () => {
    setFriendToInvite(null);
    setIsBetSelectionDialogOpen(false);
  };

  const handleConfirmBetAndInvite = (betAmount: number) => {
    if (friendToInvite) {
      if (betAmount > currentPlayerCoins) {
        // This check is a bit redundant if GameInterface also checks, but good for immediate feedback
        // A toast could be shown here if we import useToast
        alert("You don't have enough coins for this bet."); // Simple alert for now
        return;
      }
      const newLobbyId = `LB${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      setLobbyConfigForGame({
        friendName: friendToInvite,
        betAmount,
        lobbyId: newLobbyId,
      });
      handleCloseBetDialog(); // Close dialog after setting config
    }
  };

  const handleLobbyInitialized = () => {
    setLobbyConfigForGame(null); // Clear the config once GameInterface has consumed it
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground p-4 sm:p-8">
      <header className="w-full max-w-2xl mb-8 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-primary tracking-tight">
          Rock Paper Wager
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Challenge your friends, create lobbies, or join random games. Wager your coins and prove your skill!
        </p>
      </header>
      <main className="w-full max-w-lg space-y-8">
        <GameInterface
          initialLobbyConfig={lobbyConfigForGame}
          onLobbyInitialized={handleLobbyInitialized}
          onCoinsChange={setCurrentPlayerCoins} // Prop to update HomePage's coin state
        />
        <FriendManagement onInviteFriend={handleOpenBetDialog} />
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Rock Paper Wager. All rights reserved.</p>
        <p>Built with Next.js & ShadCN UI.</p>
      </footer>
      <BetSelectionDialog
        isOpen={isBetSelectionDialogOpen}
        friendName={friendToInvite}
        onClose={handleCloseBetDialog}
        onConfirmBet={handleConfirmBetAndInvite}
        currentCoins={currentPlayerCoins} // Pass current coins to dialog
      />
    </div>
  );
}
