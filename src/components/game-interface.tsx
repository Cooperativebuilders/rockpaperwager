
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HandMetal, Hand, Scissors, Wallet, Users, UserPlus, DoorOpen, XCircle, Hourglass, Repeat, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Move, Outcome } from '@/lib/game';
import { MOVES, determineWinner, MOVE_EMOJIS } from '@/lib/game';
import { cn } from '@/lib/utils';
import { CoinDisplay } from '@/components/coin-display';
import { TopUpDialog } from '@/components/top-up-dialog';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import type { LobbyConfig } from '@/app/page';

type GameState =
  | 'initial'
  | 'selecting_bet_for_lobby'
  | 'waiting_for_friend'
  | 'searching_for_random'
  | 'choosing_move'
  | 'revealing_moves'
  | 'game_result';

const MOVE_ICONS: Record<Move, React.ElementType> = {
  rock: HandMetal,
  paper: Hand,
  scissors: Scissors,
};

const BET_AMOUNTS = [10, 100, 1000];
const SIMULATED_FRIENDS_LIST = ['Alice (Simulated)', 'Bob (Simulated)', 'Charlie (Simulated)', 'Dave (Simulated)', 'Eve (Simulated)', 'Mallory (Simulated)'];

interface GameInterfaceProps {
  initialLobbyConfig?: LobbyConfig | null;
  onLobbyInitialized?: () => void;
  onCoinsChange?: (newCoinAmount: number) => void;
  onActiveGameChange?: (isActive: boolean) => void; // New prop
}

export default function GameInterface({ initialLobbyConfig, onLobbyInitialized, onCoinsChange, onActiveGameChange }: GameInterfaceProps) {
  const [coins, setCoins] = useState(1000);
  const [placedBet, setPlacedBet] = useState(0);
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [opponentMove, setOpponentMove] = useState<Move | null>(null);
  const [resultText, setResultText] = useState('');
  const [gameState, setGameState] = useState<GameState>('initial');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [opponentName, setOpponentName] = useState("Opponent");
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);
  
  const [selectedFriendForLobby, setSelectedFriendForLobby] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuggestionsPopoverOpen, setIsSuggestionsPopoverOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (onCoinsChange) {
      onCoinsChange(coins);
    }
  }, [coins, onCoinsChange]);

  useEffect(() => {
    if (onActiveGameChange) {
      const activeStates: GameState[] = ['waiting_for_friend', 'searching_for_random', 'choosing_move', 'revealing_moves', 'game_result'];
      onActiveGameChange(activeStates.includes(gameState));
    }
  }, [gameState, onActiveGameChange]);

  useEffect(() => {
    if (initialLobbyConfig && !isProcessing) {
      if (lobbyId === initialLobbyConfig.lobbyId && gameState === 'waiting_for_friend') return;

      setOpponentName(initialLobbyConfig.friendName);
      setPlacedBet(initialLobbyConfig.betAmount);
      setLobbyId(initialLobbyConfig.lobbyId);
      
      setPlayerMove(null);
      setOpponentMove(null);
      setResultText('');
      setStatusMessage('');
      setIsProcessing(false);
      setSelectedFriendForLobby(null);
      setSearchTerm('');

      setGameState('waiting_for_friend');
      
      if (onLobbyInitialized) {
        onLobbyInitialized();
      }
    }
  }, [initialLobbyConfig, onLobbyInitialized, isProcessing, lobbyId, gameState]);


  useEffect(() => {
    let gameStartTimer: NodeJS.Timeout;
    if (gameState === 'waiting_for_friend' || gameState === 'searching_for_random') {
      setIsProcessing(true);
      let currentStatus = '';
      if (gameState === 'waiting_for_friend' && lobbyId && opponentName) {
        const displayOpponent = opponentName === "Opponent" ? "your friend" : opponentName;
        currentStatus = `Lobby ID: ${lobbyId}. Share this ID with ${displayOpponent} to invite them! Waiting for ${displayOpponent} to join...`;
      } else if (gameState === 'searching_for_random' && opponentName !== "Opponent") {
         currentStatus = `Searching for ${opponentName} at ${placedBet} coins...`;
      } else {
        currentStatus = `Searching for a random player at ${placedBet} coins...`;
      }
      setStatusMessage(currentStatus);

      gameStartTimer = setTimeout(() => {
        toast({ title: `${opponentName} Found!`, description: "The game is about to begin.", variant: 'default' });
        setGameState('choosing_move');
        setIsProcessing(false);
        setStatusMessage('');
      }, 3000);
    }
    return () => clearTimeout(gameStartTimer);
  }, [gameState, lobbyId, placedBet, toast, opponentName]);

   useEffect(() => {
    let revealTimer: NodeJS.Timeout;
    if (gameState === 'revealing_moves' && playerMove) {
      setIsProcessing(true);
      setStatusMessage(`You played ${MOVE_EMOJIS[playerMove]}. Waiting for ${opponentName}...`);
      const randomOpponentMove = MOVES[Math.floor(Math.random() * MOVES.length)];
      setOpponentMove(randomOpponentMove);

      revealTimer = setTimeout(() => {
        const outcome = determineWinner(playerMove, randomOpponentMove);
        let message = '';
        let newCoins = coins;
        let toastVariant: 'default' | 'destructive' = 'default';

        switch (outcome) {
          case 'win':
            newCoins += placedBet;
            message = `You won ${placedBet} coins!`;
            toastVariant = 'default';
            toast({ title: "Congratulations! 🎉", description: message, variant: toastVariant});
            break;
          case 'lose':
            newCoins -= placedBet;
            message = `You lost ${placedBet} coins.`;
            toastVariant = 'destructive';
            toast({ title: "Oh no! 😢", description: message, variant: toastVariant });
            break;
          case 'draw':
            message = "It's a draw!";
            toast({ title: "It's a Tie! 🤝", description: message });
            break;
        }
        setCoins(newCoins);
        setResultText(`${MOVE_EMOJIS[playerMove]} vs ${MOVE_EMOJIS[randomOpponentMove]} - ${message}`);
        setGameState('game_result');
        setIsProcessing(false);
        setStatusMessage('');
      }, 1500);
    }
    return () => clearTimeout(revealTimer);
  }, [gameState, playerMove, placedBet, coins, toast, opponentName]);

  const resetCommonStates = () => {
    setPlayerMove(null);
    setOpponentMove(null);
    setResultText('');
    setStatusMessage('');
    setIsProcessing(false);
  };

  const handleCreateLobbyIntent = () => {
    resetCommonStates();
    setSelectedFriendForLobby(null); 
    setSearchTerm('');
    setOpponentName("Friend");
    setGameState('selecting_bet_for_lobby');
  };

  const handleFinalizeLobbyWithFriendAndBet = (amount: number) => {
    if (isProcessing) return;
    if (!selectedFriendForLobby) {
      toast({ title: 'Friend Not Selected', description: 'Please select a friend from the suggestions to invite.', variant: 'destructive' });
      return;
    }
    if (amount > coins) {
      toast({ title: 'Insufficient Coins', description: 'You do not have enough coins to create a lobby with this bet.', variant: 'destructive' });
      setIsTopUpDialogOpen(true);
      return;
    }
    setPlacedBet(amount);
    setOpponentName(selectedFriendForLobby);
    const newLobbyId = `LB${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    setLobbyId(newLobbyId);
    resetCommonStates(); 
    setGameState('waiting_for_friend');
  };

  const handleJoinRandomGame = (amount: number) => {
    if (isProcessing) return;
    if (amount > coins) {
      toast({ title: 'Insufficient Coins', description: 'You do not have enough coins to join a game with this bet.', variant: 'destructive' });
      setIsTopUpDialogOpen(true);
      return;
    }
    setPlacedBet(amount);
    setLobbyId(null);
    setOpponentName("Random Player");
    resetCommonStates();
    setGameState('searching_for_random');
  };

  const handleMakeMove = (move: Move) => {
    if (isProcessing) return;
    setPlayerMove(move);
    setGameState('revealing_moves');
  };

  const handleCancelAndReturnToInitial = () => {
    resetCommonStates();
    setPlacedBet(0);
    setLobbyId(null);
    setOpponentName("Opponent");
    setSelectedFriendForLobby(null);
    setSearchTerm('');
    setIsSuggestionsPopoverOpen(false);
    setGameState('initial');
  };

  const handleRematch = () => {
    if (coins < placedBet) {
      toast({ title: 'Insufficient Coins for Rematch', description: 'You need more coins. Returning to main menu.', variant: 'destructive' });
      setIsTopUpDialogOpen(true);
      handleCancelAndReturnToInitial();
      return;
    }
    resetCommonStates();
    setGameState('choosing_move');
  };

  const handleOpenTopUpDialog = () => {
    setIsTopUpDialogOpen(true);
  };

  const handleCloseTopUpDialog = () => {
    setIsTopUpDialogOpen(false);
  };

  const handleConfirmCoinPurchase = (purchaseAmount: number) => {
    setCoins(prevCoins => prevCoins + purchaseAmount);
    toast({
      title: "Coins Added!",
      description: `You've (simulated) purchased ${purchaseAmount.toLocaleString()} coins. Your balance is updated.`,
      variant: 'default'
    });
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setSelectedFriendForLobby(null); 

    if (newSearchTerm.trim() === '') {
      setIsSuggestionsPopoverOpen(false);
    } else {
      const filtered = SIMULATED_FRIENDS_LIST.filter(friend =>
        friend.toLowerCase().includes(newSearchTerm.toLowerCase())
      );
      setIsSuggestionsPopoverOpen(filtered.length > 0);
    }
  };

  const handleSuggestionClick = (friendName: string) => {
    setSelectedFriendForLobby(friendName.replace(" (Simulated)", ""));
    setSearchTerm(friendName); 
    setIsSuggestionsPopoverOpen(false);
  };

  const renderMoveButton = (move: Move) => {
    const IconComponent = MOVE_ICONS[move];
    return (
      <Button
        key={move}
        variant="outline"
        size="lg"
        className="flex-1 transform transition-transform hover:scale-105 focus:scale-105 shadow-lg rounded-xl p-6"
        onClick={() => handleMakeMove(move)}
        disabled={isProcessing}
        aria-label={`Choose ${move}`}
      >
        <IconComponent className="w-10 h-10 mr-2" />
        <span className="capitalize text-lg">{move}</span>
      </Button>
    );
  };

  const getCardTitle = () => {
    switch (gameState) {
      case 'initial': return "Choose Your Path";
      case 'selecting_bet_for_lobby': return "Create Lobby";
      case 'waiting_for_friend': return `Lobby with ${opponentName}`;
      case 'searching_for_random': return `Searching for ${opponentName}`;
      case 'choosing_move': return `Your Turn vs ${opponentName} (Bet: ${placedBet})`;
      case 'revealing_moves':
      case 'game_result':
        return `Results vs ${opponentName}`;
      default: return "Rock Paper Wager";
    }
  };
  
  const filteredSuggestions = SIMULATED_FRIENDS_LIST.filter(friend =>
    friend.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TooltipProvider>
      <Card className="w-full shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="bg-primary/10 p-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold text-primary">{getCardTitle()}</CardTitle>
            <CoinDisplay amount={coins} onPurchaseClick={handleOpenTopUpDialog} />
          </div>
          { (gameState === 'choosing_move' || gameState === 'waiting_for_friend' || gameState === 'searching_for_random' || gameState === 'game_result') && placedBet > 0 &&
            <CardDescription className="text-md pt-2">Current Bet: {placedBet} coins</CardDescription>
          }
        </CardHeader>

        <CardContent className="p-6 space-y-6 min-h-[200px] flex flex-col justify-center">
          {isProcessing && (gameState === 'waiting_for_friend' || gameState === 'searching_for_random' || gameState === 'revealing_moves') && (
            <div className="flex flex-col items-center justify-center text-xl font-semibold text-muted-foreground py-4">
              <Hourglass className="animate-spin h-10 w-10 mr-3 mb-3 text-accent" />
              {statusMessage || "Processing..."}
            </div>
          )}

          {gameState === 'initial' && !isProcessing && (
            <div className="space-y-4">
              <Button onClick={handleCreateLobbyIntent} size="lg" className="w-full p-6 text-lg">
                <Users className="mr-2" /> Create a Lobby (vs Friend)
              </Button>
              <p className="text-center text-muted-foreground my-4">Or Join a Random Game:</p>
              <div className="flex flex-col sm:flex-row sm:gap-4 items-center sm:justify-around">
                {BET_AMOUNTS.map((amount) => (
                  <Button
                    key={`join-${amount}`}
                    onClick={() => handleJoinRandomGame(amount)}
                    className="rounded-full w-28 h-28 flex flex-col items-center justify-center p-3 text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transform transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isProcessing || amount > coins}
                    aria-label={`Join random game with ${amount} coins bet`}
                  >
                    <Wallet className="mb-1 h-6 w-6" />
                    Bet {amount}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'selecting_bet_for_lobby' && !isProcessing && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="friend-search" className="text-md font-semibold text-muted-foreground">Invite a Friend (Simulated Search):</Label>
                <Popover open={isSuggestionsPopoverOpen} onOpenChange={setIsSuggestionsPopoverOpen}>
                  <PopoverTrigger asChild>
                     <div className="relative w-full">
                        <Input
                          id="friend-search"
                          type="text"
                          placeholder="Type to search friends..."
                          value={searchTerm}
                          onChange={handleSearchTermChange}
                          onFocus={() => {
                            if (searchTerm.trim() && filteredSuggestions.length > 0) {
                              setIsSuggestionsPopoverOpen(true);
                            }
                          }}
                          autoComplete="off"
                          className="w-full"
                        />
                      </div>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-[--radix-popover-trigger-width] p-0" 
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className="max-h-40 overflow-y-auto">
                    {filteredSuggestions.map((friend) => (
                      <div
                        key={friend}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        onMouseDown={() => handleSuggestionClick(friend)}
                      >
                        {friend}
                      </div>
                    ))}
                    {filteredSuggestions.length === 0 && searchTerm.trim() !== '' && (
                       <div className="px-3 py-2 text-sm text-muted-foreground">No friends found.</div>
                    )}
                    </div>
                  </PopoverContent>
                </Popover>
                 {selectedFriendForLobby && <p className="text-sm text-green-600">Selected: {selectedFriendForLobby}</p>}
              </div>
              
              <div>
                <p className="text-center text-muted-foreground mb-3">Select Bet Amount:</p>
                <div className="flex flex-col sm:flex-row sm:gap-4 items-center sm:justify-around">
                  {BET_AMOUNTS.map((amount) => (
                    <Button
                      key={`create-bet-${amount}`}
                      onClick={() => handleFinalizeLobbyWithFriendAndBet(amount)}
                      className="rounded-full w-28 h-28 flex flex-col items-center justify-center p-3 text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transform transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={isProcessing || amount > coins || !selectedFriendForLobby}
                      aria-label={`Create lobby with ${selectedFriendForLobby || 'friend'} with ${amount} coins bet`}
                    >
                      <UserPlus className="mb-1 h-6 w-6" />
                      Bet {amount}
                    </Button>
                  ))}
                </div>
              </div>
              <Button onClick={handleCancelAndReturnToInitial} variant="outline" className="w-full mt-4">
                <XCircle className="mr-2"/> Cancel
              </Button>
            </div>
          )}

          {(gameState === 'waiting_for_friend' || gameState === 'searching_for_random') && isProcessing && (
             <Button onClick={handleCancelAndReturnToInitial} variant="outline" className="w-full mt-auto self-center max-w-xs">
              <XCircle className="mr-2"/> Cancel Search/Lobby
            </Button>
          )}

          {gameState === 'choosing_move' && !isProcessing && (
            <div className="flex flex-col sm:flex-row gap-4 justify-around">
              {MOVES.map(renderMoveButton)}
            </div>
          )}

          {(gameState === 'revealing_moves' || gameState === 'game_result') && !isProcessing && (
            <div className="text-center space-y-4 p-4 bg-secondary/30 rounded-lg">
              {playerMove && (
                <p className="text-2xl font-semibold">
                  You played: <span className="text-primary">{MOVE_EMOJIS[playerMove]} {playerMove}</span>
                </p>
              )}
              {opponentMove && (
                <p className="text-2xl font-semibold">
                  {opponentName} played: <span className="text-destructive">{MOVE_EMOJIS[opponentMove]} {opponentMove}</span>
                </p>
              )}
              {resultText && (
                <p className={cn(
                  "text-3xl font-bold py-2",
                  resultText.includes("won") && "text-green-600 dark:text-green-400",
                  resultText.includes("lost") && "text-red-600 dark:text-red-400",
                  resultText.includes("draw") && "text-yellow-600 dark:text-yellow-400"
                )}>
                  {resultText.substring(resultText.indexOf('- ') + 2)}
                </p>
              )}
            </div>
          )}
        </CardContent>

        {(gameState === 'game_result' || (gameState === 'choosing_move' && !isProcessing) ) && (
          <CardFooter className="p-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {gameState === 'game_result' && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleRematch}
                      variant="default"
                      size="icon"
                      className="rounded-full w-16 h-16 disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={isProcessing || coins < placedBet}
                      aria-label={`Rematch ${opponentName} for ${placedBet} coins`}
                    >
                      <Repeat className="w-8 h-8" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rematch {opponentName} ({placedBet} coins)</p>
                    {coins < placedBet && <p className="text-destructive">Not enough coins!</p>}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleCancelAndReturnToInitial}
                      variant="outline"
                      size="icon"
                      className="rounded-full w-16 h-16"
                      disabled={isProcessing && gameState !== 'choosing_move'}
                      aria-label="Leave to Main Menu"
                    >
                      <DoorOpen className="w-8 h-8" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Leave to Main Menu</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            { gameState === 'choosing_move' && !isProcessing &&
              <Button
                onClick={handleCancelAndReturnToInitial}
                className="flex-1 text-lg"
                size="lg"
                variant="outline"
              >
                <DoorOpen className="mr-2"/> Leave Game
              </Button>
            }
          </CardFooter>
        )}
      </Card>
      <TopUpDialog
        isOpen={isTopUpDialogOpen}
        onClose={handleCloseTopUpDialog}
        onConfirmPurchase={handleConfirmCoinPurchase}
      />
    </TooltipProvider>
  );
}
