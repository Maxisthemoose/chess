const map: string[] = ["a", "b", "c", "d", "e", "f", "g", "h"];

/**
 *
 * @param pos Board position represented in Algebraic Notation... IE: a1 = bottom left, h8 = top right
 * @returns Physical 2d array, board location. IE: a1 will turn into [0, 7]
 */
export function posToCords(pos: string): [number, number] {
  const parts = pos.split("");
  if (parts.length > 2) return [-1, -1];

  const letter = parts[0];
  const number = parseInt(parts[1]);

  const p2 = map.findIndex((v) => v === letter);
  const p1 = 8 - number;

  return [p1, p2];
}

/**
 * @param cords takes cordinates and turns them into algebraic notation. Beware, I was lazy and didn't make this convert correctly, so conversion must be done before hand. First cordinate represents the number in "a1", Second cordinate represents the letter in "a1", IE: [1, 0] turns into "a1".
 * @returns Algebraic notation of the board location
 */
export function cordsToPos(cords: [number, number]): string {
  let str = "";
  str += map[cords[0]];
  str += cords[1];
  return str;
}
