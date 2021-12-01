import chalk, { black, white } from "chalk";
import clone from "clone";
import { cordsToPos, posToCords } from "../Utils/functions";
import Move from "../Utils/MovesInterface";
import pieceValues from "../Utils/pieceValues";
import { PiecesEnum } from "./PiecesEnum";

export class Piece {
  private otherPieces: Piece[] = [];
  // private canCastle: null | boolean = null;
  private pieceValue: number = 0;

  constructor(
    private piece: PiecesEnum,
    private pieceLocation: string,
    private board: string[][],
    private Moved: boolean,
  ) {
    // if (this.piece === "K" || this.piece === "k" || this.piece === "R" || this.piece === "r") this.canCastle = true;
    this.pieceValue = pieceValues[this.piece.toLowerCase() as "p" | "r" | "n" | "b" | "q"];
  }

  public setOtherPieces(pieces: Piece[]): void {
    this.otherPieces = [];
    for (const p of pieces) {
      if (p.location !== this.pieceLocation) this.otherPieces.push(p);
    }
  }

  public set moved(bool: boolean) {
    this.moved = bool;
  }

  public get type(): string {
    return this.piece;
  }

  public get color(): "b" | "w" {
    return this.piece.toLocaleLowerCase() === this.piece ? "b" : "w";
  }

  public get location(): string {
    return this.pieceLocation;
  }

  public set location(loc: string) {
    this.pieceLocation = loc;
  }

  public get moves(): Move[] | "check" | "checkmate" {
    const moves: Move[] = [];

    const whiteCheck = this.checkWhiteCheck();
    // console.log(whiteCheck);
    // process.exit();
    if (this.color === "w" && this.type === "K" && whiteCheck !== -1 && whiteCheck.inCheck) {
      this.addToMovesK(moves, whiteCheck.canMove);
      return moves;
    } else if (this.color === "w" && this.type !== "K" && whiteCheck !== -1 && whiteCheck.inCheck)
      return []
    // if (this.type !== )
    // console.log(this.checkWhiteCheck());
    // if (this.piece.toLowerCase() === PiecesEnum.k) {
    //   const check = 
    // } 

    if (
      this.piece === PiecesEnum.P ||
      this.piece === PiecesEnum.p
    )
      this.addToMovesP(moves);
    else if (
      this.piece === PiecesEnum.R ||
      this.piece === PiecesEnum.r
    )
      this.addToMovesR(moves);
    else if (
      this.piece === PiecesEnum.N ||
      this.piece === PiecesEnum.n
    ) 
      this.addToMovesN(moves);
    else if (
      this.piece === PiecesEnum.B ||
      this.piece === PiecesEnum.b
    )
      this.addToMovesB(moves);
    else if (
      this.piece === PiecesEnum.Q ||
      this.piece === PiecesEnum.q
    ) 
      this.addToMovesQ(moves);
    else if (
      this.piece === PiecesEnum.K ||
      this.piece === PiecesEnum.k
    ) {
      this.addToMovesK(moves);
      // const check = this.checkCheck(moves);
      // if (check === "check") return "check";
      // else if (check === "checkmate") return "checkmate";
    }


    return moves;
  }
  // pawn
  private addToMovesP(moves: Move[]) {
    let multi = 1;
    if (this.color === "w") multi = -1;
    for (let i = 1; i <= 2; i++) {
      const currentCords = posToCords(this.pieceLocation);
      // Diagonal take
      const diag = [
        [1, 1],
        [1, -1],
      ];
      for (const move of diag) {
        const newMoveCords: [number, number] = [currentCords[1] + move[0], 8 - currentCords[0] + move[1]];
        const cordsAsPos = cordsToPos(newMoveCords);

        const found = this.otherPieces.find((p) => p.pieceLocation === cordsAsPos);
        if (found && found.color !== this.color) {
          moves.push({ take: true, move: cordsAsPos, takenPiece: found });
        }
      }
      
      if (this.Moved && i === 2) continue;
      const move: [number, number] = [
        currentCords[1],
        8 - Math.abs(currentCords[0] + i * multi)
      ];

      const moveAsPos = cordsToPos(move);
      if (this.otherPieces.find((v) => v.location === moveAsPos)) {
        break;
      } else {
        moves.push({ take: false, move: moveAsPos });
      }
    }

    return;
  }
  // castle
  private addToMovesR(moves: Move[]) {
    const pieceCords = posToCords(this.pieceLocation);

    // [0] = up, [1] = right, [2] = down, [3] = left
    const distToEdges = [
      pieceCords[0],
      8 - pieceCords[1] - 1,
      Math.abs(7 - pieceCords[0]),
      pieceCords[1],
    ];
    // [0] = up, [1] = right, [2] = down, [3] = left
    const dirs = [-1, 0, 0, -1] as const;

    for (let j = 0; j < 4; j++) {
      const dirMulti = dirs[j];
      inner: for (let i = 0; i <= distToEdges[j]; i++) {
        let newPos: [number, number];
        if (j === 0) {
          newPos = [
            pieceCords[1],
            8 - Math.abs((pieceCords[0]) + i * dirMulti),
          ];
        } else if (j === 1) {
          newPos = [pieceCords[1] + i, 8 - Math.abs(pieceCords[0])];
        } else if (j === 2) {
          newPos = [pieceCords[1], 8 - Math.abs(pieceCords[0] + i)];
        } else {
          newPos = [pieceCords[1] + i * dirMulti, 8 - Math.abs(pieceCords[0])];
        }
        const moveAsPos = cordsToPos(newPos);
        const otherPiece = this.otherPieces.find((v) => v.pieceLocation === moveAsPos);
        if (moveAsPos === this.pieceLocation) continue;
        if (otherPiece) {
          if (otherPiece.color !== this.color) moves.push({ take: true, move: cordsToPos(newPos), takenPiece: otherPiece });
          break inner;
        } else moves.push({ take: false, move: cordsToPos(newPos) });
      }
    }

    // if (moves.length > 0 && this.piece.toLowerCase() === "r") this.canCastle = false;
  }
  // knight
  private addToMovesN(moves: Move[]) {
    const currentCords: [number, number] = posToCords(this.pieceLocation);

    const arrayOfMoves = [
      [2, 1], // Up two, right one
      [2, -1], // Up two, left one
      [1, 2], // Up one, right two
      [-1, 2], // Down one, right two
      [-2, 1], // Down two, right one
      [-2, -1], // Down two, left one
      [-1, -2], // Down one, left two
      [1, -2] // Up one, left two
    ];

    for (const arr of arrayOfMoves) {
      
      const upDown = arr[0];
      const leftRight = arr[1];

      const newCords: [number, number] = [currentCords[1] + upDown, 8 - currentCords[0] + leftRight];

      const newPos: string = cordsToPos(newCords);
      const otherPiece = this.otherPieces.find((v) => v.pieceLocation === newPos);
      if (newCords[0] < 0 || 
        newCords[0] > 7 || 
        newCords[1] < 1 || 
        newCords[1] > 8 
      ) continue;
      else if (otherPiece && otherPiece.color !== this.color) 
        moves.push({ take: true, move: newPos, takenPiece: otherPiece });
      else if (otherPiece) {
        continue;
      } else moves.push({ take: false, move: newPos });
    }
  }
  // bishop
  private addToMovesB(moves: Move[]) {
    
    const moveTypes = [
      [1, 1], // up, right
      [1, -1], // up left
      [-1, -1], // down left
      [-1, 1] // down right
    ];

    
    for (let i = 0; i < moveTypes.length; i++) {
      let loop = true;
      const moveType = moveTypes[i];
      const piecePos = posToCords(this.pieceLocation);
      let newCords: [number, number] = [piecePos[1], 8 - piecePos[0]];

      do {
        newCords[0] += moveType[0];
        newCords[1] += moveType[1];

        if (newCords[0] < 0 || 
        newCords[0] > 7 || 
        newCords[1] < 1 || 
        newCords[1] > 8) break;
        
        const newPos = cordsToPos(newCords);
        const otherPiece = this.otherPieces.find((v) => v.pieceLocation === newPos);
        if (otherPiece && otherPiece.color !== this.color) {
          moves.push({ take: true, move: newPos, takenPiece: otherPiece });
          break;
        } else if (otherPiece && otherPiece.color === this.color) break;

        moves.push({ take: false, move: newPos });

      } while (loop);
    }
  }
  // queen
  private addToMovesQ(moves: Move[]) {
    this.addToMovesR(moves);
    this.addToMovesB(moves);
  }

  private addToMovesK(moves: Move[], canMoveTo?: [number, number][]) {
    const currentPos = this.pieceLocation;
    const cords = posToCords(currentPos);
    if (canMoveTo !== undefined) console.log(canMoveTo);
    if (canMoveTo !== undefined) {
      for (const cords of canMoveTo) {
        const move = cordsToPos(cords);
        let take = false;
        // if (this.otherPieces.filter(p => p.color === "b" && p.location === move)) take = true;
        moves.push({ move, take });
      }
    } else {
      const allDirs = [
        [1, 0], // up
        [0, 1], // right
        [-1, 0], // down
        [0, -1], // left
      ];

      for (const dir of allDirs) {
        const newCords: [number, number] = [cords[1] + dir[0], 8 - cords[0] + dir[1]];
        const newPos = cordsToPos(newCords);

        if (newCords[1] < 1) continue;

        const pieceInLocation = this.otherPieces.find((v) => v.pieceLocation === newPos);

        if (pieceInLocation && pieceInLocation.color === this.color) continue;
        else if (pieceInLocation && pieceInLocation.color !== this.color) moves.push({ take: true, move: newPos, takenPiece: pieceInLocation });
        else moves.push({ take: false, move: newPos });
      }
      
      this.castle(moves);
    }
  }

  private castle(moves: Move[]) {
    if (this.piece.toLowerCase() !== "k") return;
    if (this.moved) return;
    //                      Queen Side        King Side
    const targetSpaces: [[number, number], [number, number]] = this.color === "w" ? [[0, 1], [7, 1]] : [[0, 8], [7, 8]];
   
    for (const target of targetSpaces) {
      const spaceAsPos = cordsToPos(target);
      const pieceInPos = this.otherPieces.find(v => v.pieceLocation === spaceAsPos);
      if (pieceInPos && (this.color === "w" ? pieceInPos.type === "R" : pieceInPos.type === "r") && !pieceInPos.moved) {

        let x = 1;
        let y = this.color === "w" ? 0 : 7;
        let canCastleKingSide = false;
        let canCastleQueenSide = false;
        for (let i = 1; i < 3; i++) {
          const cords: [number, number] = [y, x];
          const pos = cordsToPos(cords);
          if (this.otherPieces.find((v) => v.pieceLocation === pos)) break;
          x++;
          if (i === 2) canCastleKingSide = true;
        }

        x = 1;

        for (let j = 1; j < 4; j++) {
          const cords: [number, number] = [y, x];
          const pos = cordsToPos(cords);
          if (this.otherPieces.find((v) => v.pieceLocation === pos)) break;
          x--;
          if (j === 2) canCastleQueenSide = true;
        }

        const posR_F_KS = this.color === "w" ? "h1" : "h8";
        const posR_T_KS = this.color === "w" ? "f1" : "f8";

        const posR_F_QS = this.color === "w" ? "a1" : "a8";
        const posR_T_QS = this.color === "w" ? "c1" : "c8";

        const posK_F = this.color === "w" ? "e1" : "e8";
        
        const posK_T_KS = this.color === "w" ? "g1" : "g8";
        const posK_T_QS = this.color === "w" ? "b1" : "b8";
        // "canCastle" is always true                                                                          // [from, to]
        if (canCastleKingSide) moves.push({ move: "", take: false, castle: true, castleMove: [posR_F_KS, posR_T_KS], kingMove: [posK_F, posK_T_KS] });
        if (canCastleQueenSide) moves.push({ move: "", take: false, castle: true, castleMove: [posR_F_QS, posR_T_QS], kingMove: [posK_F, posK_T_QS] });
      }
    }
    
  }

  public getAllMoves(moves: Move[]) {
    this.addToMovesQ(moves);
    this.addToMovesP(moves);
    this.addToMovesN(moves);
  }

  private checkWhiteCheck() {
    const moves: Move[] = [];
    const whiteKing = clone(this.piece === "K" ? this : this.otherPieces.find(v => v.type === "K") as Piece);
    const whiteLocAsCords = posToCords(whiteKing.location);
    const whitePieces = this.otherPieces.filter(p => p.color === "w");

    this.getAllMoves(moves);

    let inCheck = false;

    const take = moves.filter(m => m.take);

    if (take.length < 1) return -1;
    else {

      inCheck = true;
      const otherKingSpaces: [number, number][] = [
        [1, -1],
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
        [-1, -1],
        [0, -1],
      ];

      const canMove: [number, number][] = [];

      for (let i = 0; i < otherKingSpaces.length; i++) {
        const tempMoves: Move[] = [];
        const cur = otherKingSpaces[i];
        const newCords: [number, number] = [cur[0] + whiteLocAsCords[1], 8 - Math.abs(cur[1] + whiteLocAsCords[0])];
        if (newCords[1] === 0) continue;

        const position = cordsToPos(newCords);

        const tp = new Piece(PiecesEnum.K, position, this.board, false);
        tp.getAllMoves(moves);
        const tpmTakes = tempMoves.filter(m => m.take);

        if (whitePieces.find(p => p.location === position)) continue;
        if (tpmTakes.length < 1) {
          otherKingSpaces.splice(otherKingSpaces.findIndex(v => v[0] === cur[0] && v[1] === cur[1]), 1)[0];
          canMove.push(posToCords(position));
        }
      }

      const a = whiteLocAsCords[1];
      const b = whiteLocAsCords[0];

      return {
        canMove: canMove.map(v => [v[1], 8 - v[0]]) as [number, number][],
        cantMove: otherKingSpaces.map(
          (v) => [v[0] + a, 8 - Math.abs(v[1] + b)].includes(0) 
          ? null 
          : [v[0] + a, 8 - Math.abs(v[1] + b)]
        ).filter(
          v => v !== null
        ) as [number, number][],
        inCheck,
      }

    }

  }

  private checkBlackCheck() {

    const blackKing = clone(this.piece === "k" ? this : this.otherPieces.find(v => v.type === "k") as Piece);

  }
}
