import { GameState } from "../type/GameState";
import { BoadManager } from "../class/BoadManager";

export class Agent {
  private static instance?: Agent;
  private gameState?: GameState;
  private difficulty?: "easy" | "hard" | "veryhard";
  public  play?: (gameState: GameState) => {i:number, j:number, k:number, l:number};

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
    this.gameState = gameState;
    const availableCells = BoadManager.availableCells(this.gameState);
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    return availableCells[randomIndex];
  }

  private easyStrategy(gameState: GameState): {i:number, j:number, k:number, l:number} {
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

  private hardStrategy(gameState: GameState): {i:number, j:number, k:number, l:number} {
    return this.randomStrategy(gameState);
  }

  private veryhardStrategy(gameState: GameState): {i:number, j:number, k:number, l:number} {
    return this.randomStrategy(gameState);
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
}