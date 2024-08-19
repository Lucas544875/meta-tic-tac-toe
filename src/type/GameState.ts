// 盤面の状態
export type GameState = {
  player:     "0"|"1",
  gameMode:   "solo" | "duo",
  difficulty: "easy" | "hard" | "veryhard" | null,
  boadState:  ("0"|"1"|"-") [][][][],
  metaBoadState: ("0"|"1"|"-")[][],
  pointedCell?: {i:number, j:number, k:number, l:number}
}