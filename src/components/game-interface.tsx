
"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DoorOpen, XCircle, Hourglass, Repeat, Settings, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Slider } from '@/components/ui/slider';
import type { LobbyConfig } from '@/app/page';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import { useRouter } from 'next/navigation';


// Custom SVG Icon Components inspired by the logo
interface CustomIconProps extends React.SVGProps<SVGSVGElement> {
  fillColor?: string;
  strokeColor?: string;
}

const IconRock = ({ fillColor = 'hsl(var(--card-foreground))', strokeColor = 'hsl(var(--primary))', ...props }: CustomIconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="5" y="10" width="14" height="10" rx="2" fill={fillColor} stroke={strokeColor} />
    <path d="M7 10V8C7 6.89543 7.89543 6 9 6H11C12.1046 6 13 6.89543 13 8V10" fill={fillColor} stroke={strokeColor} />
    <path d="M11 10V8C11 6.89543 11.8954 6 13 6H15C16.1046 6 17 6.89543 17 8V10" fill={fillColor} stroke={strokeColor} />
  </svg>
);

const IconPaper = ({ fillColor = 'hsl(var(--card-foreground))', strokeColor = 'hsl(var(--primary))', ...props }: CustomIconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 16.8V7.2C4 6.0799 4 5.51984 4.21799 5.09202C4.40973 4.71569 4.71569 4.40973 5.09202 4.21799C5.51984 4 6.0799 4 7.2 4H16.8C17.9201 4 18.4802 4 18.908 4.21799C19.2843 4.40973 19.5903 4.71569 19.782 5.09202C20 5.51984 20 6.0799 20 7.2V16.8C20 17.9201 20 18.4802 19.782 18.908C19.5903 19.2843 19.2843 19.5903 18.908 19.782C18.4802 20 17.9201 20 16.8 20H7.2C6.0799 20 5.51984 20 5.09202 19.782C4.71569 19.5903 4.40973 19.2843 4.21799 18.908C4 18.4802 4 17.9201 4 16.8Z" fill={fillColor} stroke={strokeColor}/>
    <line x1="8" y1="8" x2="8" y2="16" stroke={strokeColor} />
    <line x1="12" y1="6" x2="12" y2="16" stroke={strokeColor} />
    <line x1="16" y1="8" x2="16" y2="16" stroke={strokeColor} />
  </svg>
);

const IconScissors = ({ fillColor = 'hsl(var(--card-foreground))', strokeColor = 'hsl(var(--primary))', ...props }: CustomIconProps) => (
  <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 21V13C7 11.3431 8.34315 10 10 10H14C15.6569 10 17 11.3431 17 13V21H7Z" fill={fillColor} stroke={strokeColor} />
    <path d="M10 10L6 3" fill="none" stroke={strokeColor} />
    <path d="M14 10L18 3" fill="none" stroke={strokeColor} />
    <circle cx="7.5" cy="13.5" r="1.5" fill={fillColor} stroke={strokeColor} />
    <circle cx="16.5" cy="13.5" r="1.5" fill={fillColor} stroke={strokeColor} />
  </svg>
);


type GameState =
  | 'initial'
  | 'selecting_bet_for_lobby'
  | 'waiting_for_friend'
  | 'searching_for_random'
  | 'choosing_move'
  | 'revealing_moves'
  | 'game_result';

const MOVE_ICONS: Record<Move, React.ElementType<CustomIconProps>> = {
  rock: IconRock,
  paper: IconPaper,
  scissors: IconScissors,
};

const FIXED_BET_CONFIGS = [
  { amount: 10, name: 'Bronze', bgColor: 'bg-[hsl(var(--bronze))]', hoverBgColor: 'hover:bg-[hsl(var(--bronze-hover))]', textColor: 'text-[hsl(var(--bronze-foreground))]' },
  { amount: 100, name: 'Silver', bgColor: 'bg-[hsl(var(--silver))]', hoverBgColor: 'hover:bg-[hsl(var(--silver-hover))]', textColor: 'text-[hsl(var(--silver-foreground))]' },
  { amount: 1000, name: 'Gold', bgColor: 'bg-[hsl(var(--gold))]', hoverBgColor: 'hover:bg-[hsl(var(--gold-hover))]', textColor: 'text-[hsl(var(--gold-foreground))]' },
];

const SIMULATED_FRIENDS_LIST = ['Alice (Simulated)', 'Bob (Simulated)', 'Charlie (Simulated)', 'Dave (Simulated)', 'Eve (Simulated)', 'Mallory (Simulated)'];

interface GameInterfaceProps {
  initialLobbyConfig?: LobbyConfig | null;
  onLobbyInitialized?: () => void;
  onCoinsChange?: (newCoinAmount: number) => void; 
  onActiveGameChange?: (isActive: boolean) => void;
}

const LOGO_URL = "https://storage.googleapis.com/rock-paper-wager.firebasestorage.app/public/logo.png";

export default function GameInterface({ initialLobbyConfig, onLobbyInitialized, onCoinsChange, onActiveGameChange }: GameInterfaceProps) {
  const { user, userProfile, loading: authLoading, updateFirestoreProfile } = useAuth();
  const router = useRouter();
  const [coins, setCoins] = useState(userProfile?.coins || 0); 

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
  const [lobbyBetAmount, setLobbyBetAmount] = useState(100);
  const [customRandomBetAmount, setCustomRandomBetAmount] = useState(100);


  const { toast } = useToast();

  useEffect(() => {
    if (userProfile) {
      setCoins(userProfile.coins);
    } else if (!authLoading && !user) {
      setCoins(0); // No user, no coins
    }
  }, [userProfile, user, authLoading]);

  useEffect(() => {
    if (onCoinsChange) {
      onCoinsChange(coins);
    }
  }, [coins, onCoinsChange]);

  useEffect(() => {
    if (onActiveGameChange) {
      const activeStates: GameState[] = ['selecting_bet_for_lobby', 'waiting_for_friend', 'searching_for_random', 'choosing_move', 'revealing_moves', 'game_result'];
      onActiveGameChange(activeStates.includes(gameState));
    }
  }, [gameState, onActiveGameChange]);

  useEffect(() => {
    if (initialLobbyConfig && !isProcessing && gameState !== 'waiting_for_friend') {
      // The following line was removed due to logical contradiction:
      // if (lobbyId === initialLobbyConfig.lobbyId && gameState === 'waiting_for_friend') return; 
      if (!user) {
        toast({ title: "Login Required", description: "Please log in to join a lobby.", variant: "destructive" });
        router.push('/auth');
        return;
      }
      if (initialLobbyConfig.betAmount > coins) {
         toast({ title: 'Insufficient Coins', description: `You need ${initialLobbyConfig.betAmount} coins for this lobby, but have ${coins}.`, variant: 'destructive' });
         setIsTopUpDialogOpen(true);
         if (onLobbyInitialized) onLobbyInitialized(); // Clear config even if failed
         return;
      }

      setOpponentName(initialLobbyConfig.friendName);
      setPlacedBet(initialLobbyConfig.betAmount);
      setLobbyId(initialLobbyConfig.lobbyId);
      
      resetCommonStates();
      setGameState('waiting_for_friend');
      
      if (onLobbyInitialized) {
        onLobbyInitialized();
      }
    }
  }, [initialLobbyConfig, onLobbyInitialized, isProcessing, coins, toast, router, user, gameState]);


  useEffect(() => {
    let gameStartTimer: NodeJS.Timeout;
    if (gameState === 'waiting_for_friend' || gameState === 'searching_for_random') {
      setIsProcessing(true);
      let currentStatus = '';
      if (gameState === 'waiting_for_friend' && lobbyId && opponentName) {
        const displayOpponent = opponentName === "Friend" ? (selectedFriendForLobby || "your friend") : opponentName;
        currentStatus = `Lobby ID: ${lobbyId}. Share this ID with ${displayOpponent} to invite them! Waiting for ${displayOpponent} to join...`;
      } else if (gameState === 'searching_for_random' && opponentName !== "Random Player") {
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
  }, [gameState, lobbyId, placedBet, toast, opponentName, selectedFriendForLobby]);

   useEffect(() => {
    let revealTimer: NodeJS.Timeout;
    if (gameState === 'revealing_moves' && playerMove) {
      setIsProcessing(true);
      setStatusMessage(`You played ${MOVE_EMOJIS[playerMove]}. Waiting for ${opponentName}...`);
      const randomOpponentMove = MOVES[Math.floor(Math.random() * MOVES.length)];
      setOpponentMove(randomOpponentMove);

      revealTimer = setTimeout(async () => {
        if (!user || !userProfile) {
          toast({ title: "Error", description: "You must be logged in to play.", variant: "destructive" });
          handleCancelAndReturnToInitial();
          return;
        }
        const outcome = determineWinner(playerMove, randomOpponentMove);
        let message = '';
        let newCoins = userProfile.coins; // Start with coins from profile
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
        
        try {
          await updateFirestoreProfile(user.uid, { coins: newCoins });
          // AuthContext will update userProfile, which will trigger coin state update via useEffect
        } catch (err) {
            console.error("Failed to update coins in Firestore:", err);
            toast({ title: "Coin Update Failed", description: "Could not sync coins with server. Please try again.", variant: "destructive"});
        }
        
        setResultText(`${MOVE_EMOJIS[playerMove]} vs ${MOVE_EMOJIS[randomOpponentMove]} - ${message}`);
        setGameState('game_result');
        setIsProcessing(false);
        setStatusMessage('');
      }, 1500);
    }
    return () => clearTimeout(revealTimer);
  }, [gameState, playerMove, placedBet, user, userProfile, toast, opponentName, updateFirestoreProfile]);

  const resetCommonStates = () => {
    setPlayerMove(null);
    setOpponentMove(null);
    setResultText('');
    setStatusMessage('');
    setIsProcessing(false);
    setSelectedFriendForLobby(null);
    setSearchTerm('');
    setIsSuggestionsPopoverOpen(false);
    setLobbyBetAmount(100);
    setCustomRandomBetAmount(100);
  };

  const handleCreateLobbyIntent = () => {
    if (!user) { toast({ title: "Login Required", description: "Please log in to play with a friend.", variant: "destructive" }); router.push('/auth'); return; }
    resetCommonStates();
    setOpponentName("Friend"); 
    setGameState('selecting_bet_for_lobby');
  };

  const handleFinalizeLobbyWithFriendAndBet = (amount: number) => {
    if (isProcessing) return;
    if (!user) { toast({ title: "Login Required", description: "Please log in.", variant: "destructive" }); router.push('/auth'); return; }
    if (!selectedFriendForLobby) {
      toast({ title: 'Friend Not Selected', description: 'Please select a friend from the suggestions to invite.', variant: 'destructive' });
      return;
    }
    if (amount > coins) {
      toast({ title: 'Insufficient Coins', description: 'You do not have enough coins for this bet.', variant: 'destructive' });
      setIsTopUpDialogOpen(true);
      return;
    }
    setPlacedBet(amount);
    setOpponentName(selectedFriendForLobby);
    const newLobbyId = `LB${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    setLobbyId(newLobbyId);
    
    const currentSelectedFriend = selectedFriendForLobby; // Capture before reset
    resetCommonStates(); 
    setSelectedFriendForLobby(currentSelectedFriend); // Re-set it after resetCommonStates
    setPlacedBet(amount); // Re-set placedBet after resetCommonStates
    setOpponentName(currentSelectedFriend); // Re-set opponentName

    setGameState('waiting_for_friend');
  };

  const handleJoinRandomGame = (amount: number) => {
    if (isProcessing) return;
    if (!user) { toast({ title: "Login Required", description: "Please log in to play.", variant: "destructive" }); router.push('/auth'); return; }
    if (amount > coins) {
      toast({ title: 'Insufficient Coins', description: 'You do not have enough coins for this bet.', variant: 'destructive' });
      setIsTopUpDialogOpen(true);
      return;
    }
    setPlacedBet(amount);
    setLobbyId(null); 
    setOpponentName("Random Player"); 
    resetCommonStates();
    setPlacedBet(amount); // Re-set placedBet after resetCommonStates
    setOpponentName("Random Player"); // Re-set opponentName
    setGameState('searching_for_random');
  };

  const handleMakeMove = (move: Move) => {
    if (isProcessing || !user) return;
    setPlayerMove(move);
    setGameState('revealing_moves');
  };

  const handleCancelAndReturnToInitial = () => {
    resetCommonStates();
    setPlacedBet(0);
    setLobbyId(null);
    setOpponentName("Opponent"); 
    setGameState('initial');
  };

  const handleRematch = () => {
    if (!user) { toast({ title: "Login Required", description: "Please log in.", variant: "destructive" }); router.push('/auth'); return; }
    if (coins < placedBet) {
      toast({ title: 'Insufficient Coins for Rematch', description: 'You need more coins. Returning to main menu.', variant: 'destructive' });
      setIsTopUpDialogOpen(true);
      handleCancelAndReturnToInitial();
      return;
    }
    resetCommonStates();
    setPlacedBet(placedBet); // Keep the previous bet for rematch
    setOpponentName(opponentName); // Keep the previous opponent for rematch
    setGameState('choosing_move');
  };

  const handleOpenTopUpDialog = () => {
    if (!user) { toast({ title: "Login Required", description: "Please log in to purchase coins.", variant: "destructive" }); router.push('/auth'); return; }
    setIsTopUpDialogOpen(true);
  };

  const handleCloseTopUpDialog = () => {
    setIsTopUpDialogOpen(false);
  };

  const handleConfirmCoinPurchase = async (purchaseAmount: number) => {
    if (!user || !userProfile) {
      toast({ title: "Login Required", description: "Please log in.", variant: "destructive" });
      setIsTopUpDialogOpen(false);
      return;
    }
    const newCoinTotal = userProfile.coins + purchaseAmount;
    try {
      await updateFirestoreProfile(user.uid, { coins: newCoinTotal });
      // AuthContext will update userProfile, which will trigger coin state update
      toast({
        title: "Coins Added!",
        description: `You've (simulated) purchased ${purchaseAmount.toLocaleString()} coins. Your balance is updated.`,
        variant: 'default'
      });
    } catch (err) {
      console.error("Failed to update coins after purchase:", err);
      toast({ title: "Purchase Failed", description: "Could not update coins on server.", variant: "destructive"});
    }
    setIsTopUpDialogOpen(false);
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
        className="flex-1 transform transition-transform hover:scale-105 focus:scale-105 shadow-lg rounded-xl p-6 bg-card-foreground hover:bg-card-foreground/90 text-primary"
        onClick={() => handleMakeMove(move)}
        disabled={isProcessing || !user}
        aria-label={`Choose ${move}`}
      >
        <IconComponent className="w-10 h-10 mr-2" fillColor="hsl(var(--primary))" strokeColor="hsl(var(--card-foreground))" />
        <span className="capitalize text-lg">{move}</span>
      </Button>
    );
  };

  const filteredSuggestions = SIMULATED_FRIENDS_LIST.filter(friend =>
    friend.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const usernameDisplay = userProfile?.username || (user?.email ? user.email.split('@')[0] : "Player");
  const avatarSrc = userProfile?.avatarUrl || user?.photoURL || `https://placehold.co/64x64.png?text=${usernameDisplay.charAt(0).toUpperCase()}`;


  if (authLoading && !userProfile) { // Show loader if auth is loading AND profile isn't available yet
    return (
      <Card className="w-full shadow-2xl rounded-xl overflow-hidden bg-card min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-card-foreground">Loading Game...</p>
      </Card>
    );
  }


  return (
    <TooltipProvider>
      <Card className="w-full shadow-2xl rounded-xl overflow-hidden bg-card">
        <CardHeader className="bg-primary/10 p-6">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-x-3">
              <Avatar className="h-12 w-12 border-2 border-accent">
                <AvatarImage src={avatarSrc} alt={usernameDisplay} data-ai-hint="user avatar"/>
                <AvatarFallback className="bg-muted text-muted-foreground">{usernameDisplay.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-xl font-semibold text-card-foreground">
                {user ? usernameDisplay : "Guest"}
              </span>
            </div>

            <div className="flex-grow flex justify-center items-center px-4">
              <Image
                src={LOGO_URL}
                alt="Rock Paper Wager Logo"
                width={728} 
                height={1000} 
                className="h-10 w-auto object-contain" 
                priority
                data-ai-hint="company logo"
              />
            </div>

            <div className="flex items-center gap-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon" className="h-10 w-10 text-card-foreground hover:bg-accent/20" disabled={!user}>
                    <Link href={user ? "/profile" : "/auth"}>
                       <Settings className="h-6 w-6" />
                       <span className="sr-only">Profile Settings</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-popover text-popover-foreground border-border">
                  <p>{user ? "Profile Settings" : "Login to access Profile"}</p>
                </TooltipContent>
              </Tooltip>
              <CoinDisplay amount={user ? coins : 0} onPurchaseClick={user ? handleOpenTopUpDialog : () => router.push('/auth')} className="bg-card text-card-foreground hover:bg-card/80" />
            </div>
          </div>
          { (gameState === 'choosing_move' || gameState === 'waiting_for_friend' || gameState === 'searching_for_random' || gameState === 'game_result') && placedBet > 0 &&
            <CardDescription className="text-md pt-2 text-center text-muted-foreground">Current Bet: {placedBet} coins vs {opponentName}</CardDescription>
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
              <Button
                onClick={handleCreateLobbyIntent}
                size="lg"
                className="w-full text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transform transition-transform hover:scale-105 py-3"
                disabled={!user || isProcessing}
              >
                <Users className="mr-2" /> Play a Friend
              </Button>
              {!user && <p className="text-xs text-center text-muted-foreground">Login to play with friends.</p>}
              
              <p className="text-center text-muted-foreground my-4">Or Join a Random Game:</p>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center justify-around mb-6">
                {FIXED_BET_CONFIGS.map((config) => {
                  return (
                    <Button
                      key={`join-${config.amount}`}
                      onClick={() => handleJoinRandomGame(config.amount)}
                      className={cn(
                        "rounded-full w-28 h-28 flex flex-col items-center justify-center p-2 text-lg shadow-md transform transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed",
                        config.bgColor,
                        config.hoverBgColor,
                        config.textColor
                      )}
                      disabled={isProcessing || config.amount > coins || !user}
                      aria-label={`Join random game with ${config.amount} coins bet (${config.name})`}
                    >
                      <span className="text-xl sm:text-2xl font-bold">{config.amount}</span>
                      <span className="text-xs font-medium">COINS</span>
                    </Button>
                  );
                })}
              </div>
               <div className="space-y-3 pt-4 border-t border-border">
                 <div className="flex justify-between items-center">
                    <Label htmlFor="custom-random-bet-slider" className="text-md font-semibold text-card-foreground">
                      Or Join with a Custom Bet:
                    </Label>
                    <span className="text-lg font-semibold text-card-foreground">{customRandomBetAmount.toLocaleString()} Coins</span>
                  </div>
                  <Slider
                    id="custom-random-bet-slider"
                    value={[customRandomBetAmount]}
                    min={10}
                    max={10000} 
                    step={10}
                    onValueChange={(value) => setCustomRandomBetAmount(value[0])}
                    disabled={isProcessing || coins < 10 || !user}
                    aria-label="Custom random game bet amount slider"
                    className="data-[disabled]:opacity-50"
                  />
                  <Button
                    onClick={() => handleJoinRandomGame(customRandomBetAmount)}
                    disabled={isProcessing || customRandomBetAmount > coins || coins < 10 || !user}
                    className="w-full text-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md transform transition-transform hover:scale-105 py-3 mt-2"
                    aria-label={`Join random game with ${customRandomBetAmount} coins bet`}
                  >
                    Join Random Game with {customRandomBetAmount} Coins
                  </Button>
                   {!user && <p className="text-xs text-center text-muted-foreground mt-2">Login to play random games.</p>}
              </div>
            </div>
          )}

          {gameState === 'selecting_bet_for_lobby' && !isProcessing && user && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="friend-search" className="text-md font-semibold text-card-foreground">Invite a Friend (Simulated Search):</Label>
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
                          className="w-full bg-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0 bg-popover border-border" 
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()} 
                  >
                    <div className="max-h-40 overflow-y-auto">
                    {filteredSuggestions.map((friend) => (
                      <div
                        key={friend}
                        className="px-3 py-2 text-sm cursor-pointer text-popover-foreground hover:bg-accent hover:text-accent-foreground"
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
                 {selectedFriendForLobby && <p className="text-sm text-green-400">Selected: {selectedFriendForLobby}</p>}
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <Label htmlFor="lobby-bet-slider" className="text-md font-semibold text-card-foreground">
                      Bet Amount:
                    </Label>
                    <span className="text-lg font-semibold text-card-foreground">{lobbyBetAmount.toLocaleString()} Coins</span>
                  </div>
                  <Slider
                    id="lobby-bet-slider"
                    value={[lobbyBetAmount]} 
                    min={100}
                    max={Math.min(10000, coins)} 
                    step={100}
                    onValueChange={(value) => setLobbyBetAmount(value[0])}
                    disabled={!selectedFriendForLobby || isProcessing || coins < 100}
                    aria-label="Lobby bet amount slider"
                    className="data-[disabled]:opacity-50" 
                  />
              </div>
              <Button
                onClick={() => handleFinalizeLobbyWithFriendAndBet(lobbyBetAmount)}
                disabled={isProcessing || !selectedFriendForLobby || lobbyBetAmount > coins || coins < 100}
                className="w-full text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transform transition-transform hover:scale-105 py-3"
                aria-label={`Confirm bet and create lobby with ${selectedFriendForLobby || 'friend'} for ${lobbyBetAmount} coins`}
              >
                Confirm Bet & Create Lobby
                {selectedFriendForLobby && ` with ${selectedFriendForLobby}`}
              </Button>

              <Button onClick={handleCancelAndReturnToInitial} variant="outline" className="w-full mt-4 border-border text-foreground hover:bg-muted hover:text-muted-foreground">
                <XCircle className="mr-2"/> Cancel
              </Button>
            </div>
          )}

          {(gameState === 'waiting_for_friend' || gameState === 'searching_for_random') && isProcessing && (
             <Button onClick={handleCancelAndReturnToInitial} variant="outline" className="w-full mt-auto self-center max-w-xs border-border text-foreground hover:bg-muted hover:text-muted-foreground">
              <XCircle className="mr-2"/> Cancel
            </Button>
          )}

          {gameState === 'choosing_move' && !isProcessing && user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-around">
              {MOVES.map(renderMoveButton)}
            </div>
          )}

          {(gameState === 'revealing_moves' || gameState === 'game_result') && !isProcessing && user && (
            <div className="text-center space-y-4 p-4 bg-secondary/30 rounded-lg">
              {playerMove && (
                <p className="text-2xl font-semibold text-card-foreground">
                  You played: <span className="text-primary">{MOVE_EMOJIS[playerMove]} {playerMove}</span>
                </p>
              )}
              {opponentMove && (
                <p className="text-2xl font-semibold text-card-foreground">
                  {opponentName} played: <span className="text-destructive">{MOVE_EMOJIS[opponentMove]} {opponentMove}</span>
                </p>
              )}
              {resultText && (
                <p className={cn(
                  "text-3xl font-bold py-2",
                  resultText.includes("won") && "text-green-400",
                  resultText.includes("lost") && "text-red-500",
                  resultText.includes("draw") && "text-yellow-400"
                )}>
                  {resultText.substring(resultText.indexOf('- ') + 2)}
                </p>
              )}
            </div>
          )}
        </CardContent>

        {(gameState === 'game_result' || (gameState === 'choosing_move' && !isProcessing && user) ) && (
          <CardFooter className="p-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {gameState === 'game_result' && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleRematch}
                      variant="default"
                      size="icon"
                      className="rounded-full w-16 h-16 bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={isProcessing || coins < placedBet || !user}
                      aria-label={`Rematch ${opponentName} for ${placedBet} coins`}
                    >
                      <Repeat className="w-8 h-8" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover text-popover-foreground border-border">
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
                      className="rounded-full w-16 h-16 border-border text-foreground hover:bg-muted hover:text-muted-foreground"
                      disabled={isProcessing}
                      aria-label="Leave to Main Menu"
                    >
                      <DoorOpen className="w-8 h-8" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover text-popover-foreground border-border">
                    <p>Leave to Main Menu</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            { gameState === 'choosing_move' && !isProcessing && user &&
              <Button
                onClick={handleCancelAndReturnToInitial}
                className="flex-1 text-lg border-border text-foreground hover:bg-muted hover:text-muted-foreground"
                size="lg"
                variant="outline"
              >
                <DoorOpen className="mr-2"/> Cancel
              </Button>
            }
          </CardFooter>
        )}
      </Card>
      {user && (
        <TopUpDialog
          isOpen={isTopUpDialogOpen}
          onClose={handleCloseTopUpDialog}
          onConfirmPurchase={handleConfirmCoinPurchase}
        />
      )}
    </TooltipProvider>
  );
}

