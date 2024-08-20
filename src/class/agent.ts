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
        this.play = this.randomStrategy;
        break;
      case "hard":
        this.play = this.randomStrategy;
        break;
      case "easy":
        this.play = this.randomStrategy;
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
}