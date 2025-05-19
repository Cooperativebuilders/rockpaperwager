
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HandMetal, Hand, Scissors, Dices, Wallet, Users, UserPlus, DoorOpen, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Move, Outcome } from '@/lib/game';
import { MOVES, determineWinner, MOVE_EMOJIS } from '@/lib/game';
import { cn } from '@/lib/utils';
import { CoinDisplay } from '@/components/coin-display';

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
const SIMULATED_OPPONENT_NAME = "Opponent"; // Could be "Friend" or "Random Player" contextually

export default function GameInterface() {
  const [coins, setCoins] = useState(1000);
  const [placedBet, setPlacedBet] = useState(0);
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [opponentMove, setOpponentMove] = useState<Move | null>(null);
  const [resultText, setResultText] = useState('');
  const [gameState, setGameState] = useState<GameState>('initial');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const { toast } = useToast();

  // Simulate finding an opponent or game start
  useEffect(() => {
    let gameStartTimer: NodeJS.Timeout;
    if (gameState === 'waiting_for_friend' || gameState === 'searching_for_random') {
      setIsProcessing(true);
      setStatusMessage(gameState === 'waiting_for_friend' ? `Lobby ID: ${lobbyId}. Waiting for friend...` : `Searching for opponent at ${placedBet} coins...`);
      gameStartTimer = setTimeout(() => {
        toast({ title: "Opponent Found!", description: "The game is about to begin.", variant: 'default' });
        setGameState('choosing_move');
        setIsProcessing(false);
        setStatusMessage('');
      }, 3000); // Simulate 3 second wait
    }
    return () => clearTimeout(gameStartTimer);
  }, [gameState, lobbyId, placedBet, toast]);


  // Game reveal logic
   useEffect(() => {
    let revealTimer: NodeJS.Timeout;
    if (gameState === 'revealing_moves' && playerMove) {
      setIsProcessing(true);
      setStatusMessage(`You played ${MOVE_EMOJIS[playerMove]}. Waiting for ${SIMULATED_OPPONENT_NAME}...`);
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
      }, 1500); // Reveal delay
    }
    return () => clearTimeout(revealTimer);
  }, [gameState, playerMove, placedBet, coins, toast]);


  const resetCommonStates = () => {
    setPlayerMove(null);
    setOpponentMove(null);
    setResultText('');
    setStatusMessage('');
    setIsProcessing(false);
  };

  const handleCreateLobbyIntent = () => {
    resetCommonStates();
    setGameState('selecting_bet_for_lobby');
  };

  const handleSelectBetForLobby = (amount: number) => {
    if (isProcessing) return;
    if (amount > coins) {
      toast({ title: 'Insufficient Coins', description: 'You do not have enough coins to create a lobby with this bet.', variant: 'destructive' });
      return;
    }
    setPlacedBet(amount);
    const newLobbyId = `LB${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    setLobbyId(newLobbyId);
    resetCommonStates();
    setGameState('waiting_for_friend');
  };

  const handleJoinRandomGame = (amount: number) => {
    if (isProcessing) return;
    if (amount > coins) {
      toast({ title: 'Insufficient Coins', description: 'You do not have enough coins to join a game with this bet.', variant: 'destructive' });
      return;
    }
    setPlacedBet(amount);
    setLobbyId(null); // Not a created lobby
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
    setGameState('initial');
  };

  const handleRematch = () => {
    if (coins < placedBet) {
      toast({ title: 'Insufficient Coins for Rematch', description: 'Returning to main menu.', variant: 'destructive' });
      handleCancelAndReturnToInitial();
      return;
    }
    resetCommonStates();
    setGameState('choosing_move');
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
      case 'selecting_bet_for_lobby': return "Select Bet for Lobby";
      case 'waiting_for_friend': return "Lobby Created";
      case 'searching_for_random': return "Searching for Game";
      case 'choosing_move': return `Your Turn (Bet: ${placedBet})`;
      case 'revealing_moves':
      case 'game_result':
        return "Results";
      default: return "Rock Paper Wager";
    }
  };

  return (
    <Card className="w-full shadow-2xl rounded-xl overflow-hidden">
      <CardHeader className="bg-primary/10 p-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-3xl font-bold text-primary">{getCardTitle()}</CardTitle>
          <CoinDisplay amount={coins} />
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
              <Users className="mr-2" /> Create a Lobby
            </Button>
            <p className="text-center text-muted-foreground my-4">Or Join a Random Game:</p>
            <div className="flex flex-col sm:flex-row sm:gap-4 items-center sm:justify-around">
              {BET_AMOUNTS.map((amount) => (
                <Button
                  key={`join-${amount}`}
                  onClick={() => handleJoinRandomGame(amount)}
                  className="rounded-full w-28 h-28 flex flex-col items-center justify-center p-3 text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transform transition-transform hover:scale-105"
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
           <div className="space-y-4">
             <p className="text-center text-muted-foreground">Select the bet amount for your new lobby:</p>
            <div className="flex flex-col sm:flex-row sm:gap-4 items-center sm:justify-around">
              {BET_AMOUNTS.map((amount) => (
                <Button
                  key={`create-bet-${amount}`}
                  onClick={() => handleSelectBetForLobby(amount)}
                  className="rounded-full w-28 h-28 flex flex-col items-center justify-center p-3 text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transform transition-transform hover:scale-105"
                  disabled={isProcessing || amount > coins}
                  aria-label={`Create lobby with ${amount} coins bet`}
                >
                  <UserPlus className="mb-1 h-6 w-6" />
                  Bet {amount}
                </Button>
              ))}
            </div>
            <Button onClick={handleCancelAndReturnToInitial} variant="outline" className="w-full mt-4">
              <XCircle className="mr-2"/> Cancel
            </Button>
          </div>
        )}
        
        {(gameState === 'waiting_for_friend' || gameState === 'searching_for_random') && isProcessing && (
           <Button onClick={handleCancelAndReturnToInitial} variant="outline" className="w-full mt-auto">
             <XCircle className="mr-2"/> Cancel
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
                {SIMULATED_OPPONENT_NAME} played: <span className="text-destructive">{MOVE_EMOJIS[opponentMove]} {opponentMove}</span>
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
        <CardFooter className="p-6 flex flex-col sm:flex-row gap-4">
          {gameState === 'game_result' && (
            <Button
              onClick={handleRematch}
              className="flex-1 text-lg p-6"
              variant="default"
              disabled={isProcessing || coins < placedBet}
            >
              <CheckCircle className="mr-2"/> Rematch ({placedBet} coins)
            </Button>
          )}
          <Button
            onClick={handleCancelAndReturnToInitial}
            className="flex-1 text-lg p-6"
            variant="outline"
            disabled={isProcessing && gameState !== 'choosing_move'}
          >
            <DoorOpen className="mr-2"/> Leave to Main Menu
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
