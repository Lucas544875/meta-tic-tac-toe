import { GameState } from "../type/GameState";
import { BoadManager } from "../class/BoadManager";

export class Agent {
  private static instance?: Agent;
  private gameState?: GameState;
  private difficulty?: "easy" | "hard" | "veryhard";

  constructor(difficulty: "easy" | "hard" | "veryhard" | null) {
    if (difficulty) {
      this.difficulty = difficulty;
    }
  }

  public static getInstance(difficulty: "easy" | "hard" | "veryhard" | null): Agent {
    if(!this.instance) {
      this.instance = new Agent(difficulty);
    }
    return this.instance;
  }

  public play(gameState: GameState): {i:number, j:number, k:number, l:number} {
    this.gameState = gameState;
    const availableCells = BoadManager.availableCells(this.gameState);
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    return availableCells[randomIndex];
  }
}