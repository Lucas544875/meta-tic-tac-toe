import { GameState } from "../type/GameState";
export class BoadManager {
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

  static copyGameState(gameState: GameState): GameState {
    return {
      player: gameState.player,
      gameMode: gameState.gameMode,
      difficulty: gameState.difficulty,
      boadState: this.copyBoadState(gameState.boadState),
      metaBoadState: this.copyMetaBoadState(gameState.metaBoadState),
      pointedCell: gameState.pointedCell ? {...gameState.pointedCell} : undefined
    };
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

    return (isSettled && gameState.metaBoadState[i][j] === "-") || (isPointed && gameState.metaBoadState[i][j] === "-" && gameState.boadState[i][j][k][l] === "-");
  }

  static availableCells(gameState:GameState):{i:number, j:number, k:number, l:number}[] {
    if (!gameState.metaBoadState || !gameState.boadState) {
      return [];
    }
    // pointedCellがない場合(初手)
    if (!gameState.pointedCell){
      // すべてのマス
      let result = [];
      for (let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
          for(let k = 0; k < 3; k++) {
            for(let l = 0; l < 3; l++) {
              result.push({i, j, k, l});
            }
          }
        }
      }
      return result;
    }else if(
      gameState.metaBoadState[gameState.pointedCell.k][gameState.pointedCell.l] !== "-" 
      || gameState.boadState[gameState.pointedCell.k][gameState.pointedCell.l].every(row => row.every(cell => cell !== "-"))
    ){
      // pointedCellがあり、メタマスの大勢が決している場合
      // pointedCellがあり、メタマスがすべて埋まっている場合
      let result = [];
      for (let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
          if(gameState.metaBoadState[i][j] === "-") {
            for(let k = 0; k < 3; k++) {
              for(let l = 0; l < 3; l++) {
                if (gameState.boadState[i][j][k][l] === "-") {
                  result.push({i, j, k, l});
                }
              }
            }
          }
        }
      }
      return result;
    }else{
      // pointedCellがあり、空いてるマスがある場合
      let result = [];
      const i = gameState.pointedCell.k;
      const j = gameState.pointedCell.l;
      for(let k = 0; k < 3; k++) {
        for(let l = 0; l < 3; l++) {
          if (gameState.boadState[i][j][k][l] === "-") {
            result.push({i, j, k, l});
          }
        }
      }
      return result;
    }
  }

  static updateState (gameState:GameState, i:number, j:number, k:number, l:number):GameState {
    const nextplayer = gameState.player === "0" ? "1" : "0";
    const nextBoadState = this.copyBoadState(gameState.boadState)
    nextBoadState[i][j][k][l] = gameState.player;
    const nextMetaBoadState = this.copyMetaBoadState(gameState.metaBoadState)
    // 8/3倍に高速化できる
    if (this.checkWinner(nextBoadState[i][j]) === gameState.player) {
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
  static isHalt(gameState:GameState):boolean {
    let flag : boolean;
    flag = this.checkWinner(gameState.metaBoadState) !== "-"
    flag = flag || gameState.boadState.every((metaRow) => (metaRow.every(
      metaCell => (
        BoadManager.checkWinner(metaCell) !== "-" || metaCell.every(row => row.every(cell => cell !== "-"))
      )
    )));
    return flag;
  }
}