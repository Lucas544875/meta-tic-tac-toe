import { GameState } from "../type/GameState";
import { BoadManager } from "../class/BoadManager";

type Mark = "0" | "1" | "-";
type MetaCell = Mark | "draw";

export class Agent {
  private static instance?: Agent;
  private difficulty?: "easy" | "hard" | "veryhard";
  public  play?: (gameState: GameState, callback:(p: number) => void) => Promise<{i:number, j:number, k:number, l:number}>;

  constructor(difficulty: "easy" | "hard" | "veryhard") {
    this.difficulty = difficulty;
    switch (difficulty){
      case "veryhard":
        this.play = this.veryhardStrategy;
        break;
      case "hard":
        this.play = this.hardStrategy;
        break;
      case "easy":
        this.play = this.easyStrategy;
    }
  }

  public static getInstance(difficulty: "easy" | "hard" | "veryhard"): Agent {
    if(!this.instance || this.instance.difficulty !== difficulty) {
      this.instance = new Agent(difficulty);
    }
    return this.instance;
  }

  private randomStrategy(gameState: GameState): {i:number, j:number, k:number, l:number} {
    const availableCells = BoadManager.availableCells(gameState);
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    return availableCells[randomIndex];
  }
  
  private async easyStrategy(gameState: GameState, callback: (p: number) => void): Promise<{i:number, j:number, k:number, l:number}> {
    const availableCells = BoadManager.availableCells(gameState);
    let candidate = []
    // 揃える手があればその中からランダム
    for (const cell of availableCells) {
      let metaCell = BoadManager.copyMetaBoadState(gameState.boadState[cell.i][cell.j]);
      metaCell[cell.k][cell.l] = "1";      
      if (BoadManager.checkWinner(metaCell) === "1") {
        candidate.push(cell);
      }
    }
    if (candidate.length > 0) {
      return candidate[Math.floor(Math.random() * candidate.length)];
    }
    // リーチを防ぐ手があればその中からランダム
    for (const cell of availableCells) {
      let metaCell = BoadManager.copyMetaBoadState(gameState.boadState[cell.i][cell.j]);
      metaCell[cell.k][cell.l] = "0";      
      if (BoadManager.checkWinner(metaCell) === "0") {
        candidate.push(cell);
      }
    }
    if (candidate.length > 0) {
      return candidate[Math.floor(Math.random() * candidate.length)];
    }
    // それ以外はランダム
    return availableCells[Math.floor(Math.random() * availableCells.length)];
  }

  private async hardStrategy(gameState: GameState, callback: (p: number) => void): Promise<{i:number, j:number, k:number, l:number}> {
    return this.alphabetaStrategy(gameState, 1, callback);
  }

  private async veryhardStrategy(gameState: GameState, callback: (p: number) => void): Promise<{i:number, j:number, k:number, l:number}> {
    return this.alphabetaStrategy(gameState, 5, callback);
  }

  private static readonly lines = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]]
  ];

  private static lineScore(values: MetaCell[], weights: number[]): number {
    if (values.indexOf("draw") !== -1) {
      return 0;
    }
    const aiCount = values.filter(value => value === "1").length;
    const humanCount = values.filter(value => value === "0").length;
    if (aiCount > 0 && humanCount > 0) {
      return 0;
    }
    if (aiCount > 0) {
      return weights[aiCount];
    }
    if (humanCount > 0) {
      return -weights[humanCount];
    }
    return 0;
  }

  private static boardLineScore(board: MetaCell[][], weights: number[]): number {
    return this.lines.reduce((score, line) => {
      const values = line.map(([row, column]) => board[row][column]);
      return score + this.lineScore(values, weights);
    }, 0);
  }

  private static immediateWins(board: Mark[][], player: "0" | "1"): number {
    let wins = 0;
    for (const line of this.lines) {
      const values = line.map(([row, column]) => board[row][column]);
      const playerCount = values.filter(value => value === player).length;
      const emptyCount = values.filter(value => value === "-").length;
      if (playerCount === 2 && emptyCount === 1) {
        wins++;
      }
    }
    return wins;
  }

  private static metaCellImportance(metaBoadState: MetaCell[][], row: number, column: number): number {
    // Center and corners participate in more winning lines.
    let importance = row === 1 && column === 1 ? 1.6 : (row !== 1 && column !== 1 ? 1.3 : 1);
    for (const line of this.lines) {
      if (!line.some(([lineRow, lineColumn]) => lineRow === row && lineColumn === column)) {
        continue;
      }
      const otherCells = line
        .filter(([lineRow, lineColumn]) => lineRow !== row || lineColumn !== column)
        .map(([lineRow, lineColumn]) => metaBoadState[lineRow][lineColumn]);
      if (otherCells.indexOf("draw") !== -1 || (otherCells.indexOf("0") !== -1 && otherCells.indexOf("1") !== -1)) {
        continue;
      }
      const capturedCells = otherCells.filter(value => value === "0" || value === "1").length;
      importance += capturedCells === 1 ? 2.5 : 0.4;
    }
    return importance;
  }

  static evaluate(
    boadState: Mark[][][][],
    metaBoadState: Mark[][],
    pointedCell?: {i:number, j:number, k:number, l:number},
    nextPlayer?: "0" | "1"
  ): number {
    const winner = BoadManager.checkWinner(metaBoadState);
    if (winner === "1") {
      return 1000000;
    }
    if (winner === "0") {
      return -1000000;
    }

    // A full, uncaptured sub-board is a blocked meta cell, not an open route to victory.
    const effectiveMetaBoad: MetaCell[][] = metaBoadState.map((row, i) => row.map((cell, j) => {
      const isFull = boadState[i][j].every(subRow => subRow.every(value => value !== "-"));
      return cell === "-" && isFull ? "draw" : cell;
    }));

    // Meta-board threats dominate all local-board considerations.
    let score = this.boardLineScore(effectiveMetaBoad, [0, 450, 7000, 1000000]);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const metaCell = effectiveMetaBoad[i][j];
        const positionWeight = i === 1 && j === 1 ? 350 : (i !== 1 && j !== 1 ? 250 : 200);
        if (metaCell === "1") {
          score += positionWeight;
          continue;
        }
        if (metaCell === "0") {
          score -= positionWeight;
          continue;
        }
        if (metaCell === "draw") {
          continue;
        }

        const subBoad = boadState[i][j];
        let subScore = this.boardLineScore(subBoad, [0, 4, 45, 0]);
        subScore += subBoad[1][1] === "1" ? 5 : (subBoad[1][1] === "0" ? -5 : 0);
        subScore *= this.metaCellImportance(effectiveMetaBoad, i, j);

        const isForcedBoad = !!pointedCell && pointedCell.k === i && pointedCell.l === j;
        if (isForcedBoad) {
          // The board the opponent sends us to matters immediately, especially if it can be won now.
          subScore *= 2.5;
          const aiWins = this.immediateWins(subBoad, "1");
          const humanWins = this.immediateWins(subBoad, "0");
          if (nextPlayer === "1") {
            subScore += aiWins > 0 ? 900 : humanWins * -120;
          } else if (nextPlayer === "0") {
            subScore -= humanWins > 0 ? 900 : aiWins * -120;
          }
        }
        score += subScore;
      }
    }
    return score;
  }

  private alphabeta(gameState: GameState, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    const winner = BoadManager.checkWinner(gameState.metaBoadState);
    if (winner !== "-") {
      const terminalScore = Agent.evaluate(gameState.boadState, gameState.metaBoadState, gameState.pointedCell, gameState.player);
      // Prefer a quicker win and postpone an unavoidable loss.
      return terminalScore + (winner === "1" ? depth : -depth);
    }
    if (depth === 0) {
      return Agent.evaluate(gameState.boadState, gameState.metaBoadState, gameState.pointedCell, gameState.player);
    }

    let availableCells = BoadManager.availableCells(gameState);
    if (availableCells.length === 0) {
      return Agent.evaluate(gameState.boadState, gameState.metaBoadState, gameState.pointedCell, gameState.player);
    }

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const cell of availableCells) {
        let gameStateCopy = BoadManager.copyGameState(gameState);
        gameStateCopy = BoadManager.updateState(gameStateCopy, cell.i, cell.j, cell.k, cell.l);
        let evalScore = this.alphabeta(gameStateCopy, depth-1, alpha, beta, false);
        maxScore = Math.max(maxScore, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) {
          break;
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const cell of availableCells) {
        let gameStateCopy = BoadManager.copyGameState(gameState);
        gameStateCopy = BoadManager.updateState(gameStateCopy, cell.i, cell.j, cell.k, cell.l);
        let evalScore = this.alphabeta(gameStateCopy, depth-1, alpha, beta, true);
        minScore = Math.min(minScore, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) {
          break;
        }
      }
      return minScore;
    }
  }

  private async alphabetaStrategy(gameState: GameState, depth:number, callback:(p: number) => void): Promise<{i:number, j:number, k:number, l:number}> {
    function  fstr(cell:{i:number, j:number, k:number, l:number}) {
      return "{"+cell.i.toString()+","+cell.j.toString()+","+cell.k.toString()+","+cell.l.toString()+"}";
    }
    
    let bestScore = -Infinity;
    let bestMove;
    let availableCells = BoadManager.availableCells(gameState);
    let len = availableCells.length;
    let progress = 0;
    for (const cell of availableCells) {
      progress++;
      callback(progress/len);
      let gameStateCopy = BoadManager.copyGameState(gameState);
      gameStateCopy = BoadManager.updateState(gameStateCopy, cell.i, cell.j, cell.k, cell.l);

      let score = this.alphabeta(gameStateCopy, depth, -Infinity, Infinity, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = cell;
      }
      await new Promise<void>(resolve => setTimeout(resolve, 1))
    }
    return bestMove!;
  }
}
