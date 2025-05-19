export type Move = 'rock' | 'paper' | 'scissors';
export type Outcome = 'win' | 'lose' | 'draw';

export const MOVES: Move[] = ['rock', 'paper', 'scissors'];

export const MOVE_EMOJIS: Record<Move, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
};

export function determineWinner(playerMove: Move, opponentMove: Move): Outcome {
  if (playerMove === opponentMove) return 'draw';
  if (
    (playerMove === 'rock' && opponentMove === 'scissors') ||
    (playerMove === 'scissors' && opponentMove === 'paper') ||
    (playerMove === 'paper' && opponentMove === 'rock')
  ) {
    return 'win';
  }
  return 'lose';
}
