export function copyBoadState(boardState: ("0"|"1"|"-") [][][][]): ("0"|"1"|"-") [][][][] {
  return boardState.map((metaRow) => metaRow.map((metaCell) => metaCell.map((subRow) => [...subRow])));
}

export function copyMetaBoadState(metaBoardState: ("0"|"1"|"-")[][]): ("0"|"1"|"-")[][] {
  return metaBoardState.map((row) => [...row]);
}