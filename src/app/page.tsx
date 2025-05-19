
"use client";

import { useState } from 'react';
import GameInterface from '@/components/game-interface';
import FriendManagement from '@/components/friend-management';
import { BetSelectionDialog } from '@/components/bet-selection-dialog';
import Image from 'next/image'; // Import next/image

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
      <header className="w-full max-w-md mb-8 text-center flex flex-col items-center">
        {/* Add the logo here. Assumes logo.png is in public folder */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
          <Image
            src="/logo.png"
            alt="Rock Paper Wager Logo"
            width={400} // Adjust width as needed, maintaining aspect ratio
            height={585} // Adjust height based on original aspect ratio (e.g. if original is 400x585)
            priority // Load the logo quickly
            className="object-contain"
          />
        </div>
        {/* Removed H1 and P tags as the logo contains the app name and conveys branding */}
      </header>
      <main className="w-full max-w-lg space-y-8">
        <GameInterface
          initialLobbyConfig={lobbyConfigForGame}
          onLobbyInitialized={handleLobbyInitialized}
          onCoinsChange={setCurrentPlayerCoins}
          onActiveGameChange={setIsGameActive}
        />
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
