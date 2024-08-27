import { GameState } from "../type/GameState";
import { BoadManager } from "../class/BoadManager";

export class Agent {
  private static instance?: Agent;
  private difficulty?: "easy" | "hard" | "veryhard";
  public  play?: (gameState: GameState, callback:(p: number) => void) => {i:number, j:number, k:number, l:number};

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

  private easyStrategy(gameState: GameState, callback: (p: number) => void): {i:number, j:number, k:number, l:number} {
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

  private hardStrategy(gameState: GameState, callback: (p: number) => void): {i:number, j:number, k:number, l:number} {
    return this.alphabetaStrategy(gameState, 1, callback);
  }

  private veryhardStrategy(gameState: GameState, callback: (p: number) => void): {i:number, j:number, k:number, l:number} {
    return this.alphabetaStrategy(gameState, 5, callback);
  }

  static evaluate(boadState: ("0"|"1"|"-") [][][][], metaBoadState: ("0"|"1"|"-") [][] ): number {
    let score = 0;
    const win = 2000
    const metaReach = 100
    const metaBlock = 60
    const subReach = 10

    let winner = BoadManager.checkWinner(metaBoadState);
    if (winner === "1") {
      score += win;
    } else if (winner === "0") {
      score -= win;
    }

    for (let i = 0; i < 3; i++){
      for (let j = 0; j < 3; j++) {
        if (metaBoadState[i][j] !== "-") {
          continue;
        }
        let metaBoadStateCopy = BoadManager.copyMetaBoadState(metaBoadState);
        metaBoadStateCopy[i][j] = "1";
        if (BoadManager.checkWinner(metaBoadStateCopy) === "1") {
          score += metaReach;
        }
        metaBoadStateCopy[i][j] = "0";
        if (BoadManager.checkWinner(metaBoadStateCopy) === "0") {
          score -= metaReach;
        }
      }
    }

    for (let i = 0; i < 3; i++){
      for (let j = 0; j < 3; j++) {
        if (metaBoadState[i][j] === "1") {
          score += metaBlock;
        } else if (metaBoadState[i][j] === "0") {
          score -= metaBlock;
        }
      }
    }

    for (let i = 0; i < 3; i++){
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++){
          for (let l = 0; l < 3; l++) {
            if (boadState[i][j][k][l] !== "-") {
              continue;
            }
            if (metaBoadState[i][j] !== "-") {
              continue;
            }
            let boadStateCopy = BoadManager.copyBoadState(boadState);
            boadStateCopy[i][j][k][l] = "1";
            if (BoadManager.checkWinner(boadStateCopy[i][j]) === "1") {
              score += subReach;
            }
            boadStateCopy[i][j][k][l] = "0";
            if (BoadManager.checkWinner(boadStateCopy[i][j]) === "0") {
              score -= subReach;
            }
          }
        }
      }
    }
    return score;
  }

  private alphabeta(gameState: GameState, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0) {
      return Agent.evaluate(gameState.boadState, gameState.metaBoadState);
    }

    let availableCells = BoadManager.availableCells(gameState);
    if (availableCells.length === 0) {
      return Agent.evaluate(gameState.boadState, gameState.metaBoadState);
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

  private alphabetaStrategy(gameState: GameState, depth:number, callback:(p: number) => void): {i:number, j:number, k:number, l:number} {
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

    }

    return bestMove!;
  }
}