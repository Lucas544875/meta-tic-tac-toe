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
}