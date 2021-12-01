const map = {
  R: "R",
  N: "N",
  B: "B",
  Q: "Q",
  K: "K",
  P: "P",
  p: "p",
  r: "r",
  n: "n",
  b: "b",
  q: "q",
  k: "k",
};

export function getChar(piece: string) {
  return map[piece as keyof typeof map];
}

export function getPiece(char: string) {
  // @ts-ignore
  return swap()[char];
}

function swap() {
  var ret = {};
  for (var key in map) {
    // @ts-ignore
    ret[map[key]] = key;
  }
  return ret;
}
