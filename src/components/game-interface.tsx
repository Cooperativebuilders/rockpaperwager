
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HandMetal, Hand, Scissors, Dices, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Move, Outcome } from '@/lib/game';
import { MOVES, determineWinner, MOVE_EMOJIS } from '@/lib/game';
import { cn } from '@/lib/utils';
import { CoinDisplay } from '@/components/coin-display';

type GameState = 'betting' | 'choosing' | 'revealing' | 'result';

const MOVE_ICONS: Record<Move, React.ElementType> = {
  rock: HandMetal,
  paper: Hand,
  scissors: Scissors,
};

const BET_AMOUNTS = [10, 100, 1000];
const OPPONENT_NAME = "AI Bot";

export default function GameInterface() {
  const [coins, setCoins] = useState(1000);
  const [placedBet, setPlacedBet] = useState(0);
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [opponentMove, setOpponentMove] = useState<Move | null>(null);
  const [resultText, setResultText] = useState('');
  const [gameState, setGameState] = useState<GameState>('betting');
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    let revealTimer: NodeJS.Timeout;
    if (gameState === 'revealing' && playerMove) {
      setIsProcessing(true);
      // Simulate opponent's choice and reveal
      const randomOpponentMove = MOVES[Math.floor(Math.random() * MOVES.length)];
      setOpponentMove(randomOpponentMove);

      revealTimer = setTimeout(() => {
        const outcome = determineWinner(playerMove, randomOpponentMove);
        let message = '';
        let newCoins = coins;

        switch (outcome) {
          case 'win':
            newCoins += placedBet;
            message = `You won ${placedBet} coins!`;
            toast({ title: "Congratulations! 🎉", description: message, variant: 'default' });
            break;
          case 'lose':
            newCoins -= placedBet;
            message = `You lost ${placedBet} coins. Better luck next time!`;
            toast({ title: "Oh no! 😢", description: message, variant: 'destructive' });
            break;
          case 'draw':
            message = "It's a draw!";
            toast({ title: "It's a Tie! 🤝", description: message });
            break;
        }
        setCoins(newCoins);
        setResultText(`${MOVE_EMOJIS[playerMove]} vs ${MOVE_EMOJIS[randomOpponentMove]} - ${message}`);
        setGameState('result');
        setIsProcessing(false);
      }, 1500); // Reveal delay
    }
    return () => clearTimeout(revealTimer);
  }, [gameState, playerMove, placedBet, coins, toast]);


  const handleSelectBet = (amount: number) => {
    if (isProcessing) return;

    if (amount > coins) {
      toast({ title: 'Insufficient Coins', description: 'You do not have enough coins for this bet.', variant: 'destructive' });
      return;
    }
    setPlacedBet(amount);
    setGameState('choosing');
    setPlayerMove(null);
    setOpponentMove(null);
    setResultText('');
  };

  const handleMakeMove = (move: Move) => {
    setPlayerMove(move);
    setGameState('revealing');
  };

  const handlePlayAgain = () => {
    setGameState('betting');
    setPlayerMove(null);
    setOpponentMove(null);
    setResultText('');
    setPlacedBet(0);
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

  return (
    <Card className="w-full shadow-2xl rounded-xl overflow-hidden">
      <CardHeader className="bg-primary/10 p-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-3xl font-bold text-primary">
            {gameState === 'betting' && 'Place Your Bet'}
            {gameState === 'choosing' && 'Make Your Move'}
            {(gameState === 'revealing' || gameState === 'result') && 'Results'}
          </CardTitle>
          <CoinDisplay amount={coins} />
        </div>
        {gameState === 'choosing' && <CardDescription className="text-md pt-2">Current Bet: {placedBet} coins</CardDescription>}
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {gameState === 'betting' && (
          <div className="space-y-4 sm:space-y-0 flex flex-col sm:flex-row sm:gap-4 items-center sm:justify-around">
            {BET_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                onClick={() => handleSelectBet(amount)}
                className="rounded-full w-28 h-28 flex flex-col items-center justify-center p-3 text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transform transition-transform hover:scale-105"
                disabled={isProcessing || amount > coins}
                aria-label={`Bet ${amount} coins`}
              >
                <Wallet className="mb-1 h-6 w-6" />
                Bet {amount}
              </Button>
            ))}
          </div>
        )}

        {gameState === 'choosing' && (
          <div className="flex flex-col sm:flex-row gap-4 justify-around">
            {MOVES.map(renderMoveButton)}
          </div>
        )}

        {(gameState === 'revealing' || gameState === 'result') && (
          <div className="text-center space-y-4 p-4 bg-secondary/30 rounded-lg">
            {playerMove && (
              <p className="text-2xl font-semibold">
                You chose: <span className="text-primary">{MOVE_EMOJIS[playerMove]} {playerMove}</span>
              </p>
            )}
            {gameState === 'revealing' && !opponentMove && (
                <div className="flex items-center justify-center text-2xl font-semibold text-muted-foreground py-4">
                    <Dices className="animate-spin h-8 w-8 mr-3" /> Waiting for {OPPONENT_NAME}...
                </div>
            )}
            {opponentMove && (
              <p className="text-2xl font-semibold">
                {OPPONENT_NAME} chose: <span className="text-destructive">{MOVE_EMOJIS[opponentMove]} {opponentMove}</span>
              </p>
            )}
             {resultText && <p className={cn(
                "text-3xl font-bold py-2",
                resultText.includes("won") && "text-green-600 dark:text-green-400",
                resultText.includes("lost") && "text-red-600 dark:text-red-400",
                resultText.includes("draw") && "text-yellow-600 dark:text-yellow-400"
             )}>{resultText.substring(resultText.indexOf('- ') + 2)}</p>}
          </div>
        )}
      </CardContent>

      {gameState === 'result' && (
        <CardFooter className="p-6">
          <Button
            onClick={handlePlayAgain}
            className="w-full text-lg p-6"
            variant="outline"
          >
            Play Again (Main Menu)
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
