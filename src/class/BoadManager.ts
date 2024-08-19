import { GameState } from "../type/GameState";
export class BoardManager {
  private gamesState: GameState;

  constructor(gameState: GameState) {
    this.gamesState = gameState;
  }

  static copyBoadState(boardState: ("0"|"1"|"-") [][][][]): ("0"|"1"|"-") [][][][] {
    return boardState.map((metaRow) => metaRow.map((metaCell) => metaCell.map((subRow) => [...subRow])));
  }

  static copyMetaBoadState(metaBoardState: ("0"|"1"|"-")[][]): ("0"|"1"|"-")[][] {
    return metaBoardState.map((row) => [...row]);
  }

  static checkWinner(b:("0"|"1"|"-")[][]): "0"|"1"|"-" {
    for (let i = 0; i < 3; i++) {
      if (b[i][0] !== "-" && b[i][0] === b[i][1] && b[i][1] === b[i][2]) {
        return b[i][0];
      }
      if (b[0][i] !== "-" && b[0][i] === b[1][i] && b[1][i] === b[2][i]) {
        return b[0][i];
      }
    }
    if (b[0][0] !== "-" && b[0][0] === b[1][1] && b[1][1] === b[2][2]) {
      return b[0][0];
    }
    if (b[0][2] !== "-" && b[0][2] === b[1][1] && b[1][1] === b[2][0]) {
      return b[0][2];
    }
    return "-";
  }

  static availableCell(gameState:GameState, i:number, j:number, k:number, l:number) {
    if (!gameState.metaBoadState || !gameState.boadState) {
      return false;
    }
    const isPointed = !gameState.pointedCell || (gameState.pointedCell.k === i && gameState.pointedCell.l === j);
    const isSettled = gameState.pointedCell && (gameState.metaBoadState[gameState.pointedCell.k][gameState.pointedCell.l] !== "-" || gameState.boadState[gameState.pointedCell.k][gameState.pointedCell.l].every(row => row.every(cell => cell !== "-")));
    return isSettled || (isPointed && gameState.metaBoadState[i][j] === "-" && gameState.boadState[i][j][k][l] === "-");
  }

  static updateState (gameState:GameState, i:number, j:number, k:number, l:number):GameState {
    const nextplayer = gameState.player === "0" ? "1" : "0";
    const nextBoadState = BoardManager.copyBoadState(gameState.boadState)
    nextBoadState[i][j][k][l] = gameState.player;
    const nextMetaBoadState = BoardManager.copyMetaBoadState(gameState.metaBoadState)
    if (BoardManager.checkWinner(nextBoadState[i][j]) === gameState.player) {
      nextMetaBoadState[i][j] = gameState.player;
    }
    const nextPointedCell = {i, j, k, l};
    return {
      player: nextplayer,
      gameMode: gameState.gameMode,
      difficulty: gameState.difficulty,
      boadState: nextBoadState,
      metaBoadState: nextMetaBoadState,
      pointedCell: nextPointedCell
    };
  }
}