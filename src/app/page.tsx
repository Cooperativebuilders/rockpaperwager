
"use client";

import { useState } from 'react';
import GameInterface from '@/components/game-interface';
import FriendManagement from '@/components/friend-management';
import { BetSelectionDialog } from '@/components/bet-selection-dialog';
import Image from 'next/image';

export interface LobbyConfig {
  friendName: string;
  betAmount: number;
  lobbyId: string;
}

export default function HomePage() {
  const [isBetSelectionDialogOpen, setIsBetSelectionDialogOpen] = useState(false);
  const [friendToInvite, setFriendToInvite] = useState<string | null>(null);
  const [lobbyConfigForGame, setLobbyConfigForGame] = useState<LobbyConfig | null>(null);
  const [currentPlayerCoins, setCurrentPlayerCoins] = useState(1000); // Initial default
  const [isGameActive, setIsGameActive] = useState(false);

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
        // TODO: Replace with toast for better UX
        alert("You don't have enough coins for this bet.");
        return;
      }
      const newLobbyId = `LB${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      setLobbyConfigForGame({
        friendName: friendToInvite,
        betAmount,
        lobbyId: newLobbyId,
      });
      handleCloseBetDialog();
    }
  };

  const handleLobbyInitialized = () => {
    setLobbyConfigForGame(null);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground p-4 sm:p-8">
      <header className="w-full flex justify-center mb-8"> {/* Centering the logo container */}
        <div className="bg-card p-4 rounded-xl shadow-xl max-w-md"> {/* Logo container with green background, padding, rounding, shadow, and adjusted max-width */}
          <Image
            src="/logo.png" // Make sure public/logo.png exists
            alt="Rock Paper Wager Logo"
            width={728} // Actual width of your logo.png
            height={1000} // Actual height of your logo.png
            priority // Good for LCP
            className="object-contain w-full h-auto" // Makes image responsive within its parent div
            data-ai-hint="company logo"
          />
        </div>
      </header>
      <main className="w-full max-w-lg space-y-8">
        <GameInterface
          initialLobbyConfig={lobbyConfigForGame}
          onLobbyInitialized={handleLobbyInitialized}
          onCoinsChange={setCurrentPlayerCoins}
          onActiveGameChange={setIsGameActive}
        />
        {/* FriendManagement is only shown when a game is not active and not in lobby setup */}
        {!isGameActive && <FriendManagement onInviteFriend={handleOpenBetDialog} />}
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
        currentCoins={currentPlayerCoins}
      />
    </div>
  );
}
