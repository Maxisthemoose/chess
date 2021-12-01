import { Piece } from "../Piece/Piece";
import { PiecesEnum } from "../Piece/PiecesEnum";
import rs, { questionEMail } from "readline-sync";
import chalk from "chalk";

import { getChar, getPiece } from "../Piece/fenPieceToChar";
import { cordsToPos, posToCords } from "../Utils/functions";
import pieceValues from "../Utils/pieceValues";
import Move from "../Utils/MovesInterface";
const arrPieceTypes: string[] = [
  PiecesEnum.r,
  PiecesEnum.n,
  PiecesEnum.b,
  PiecesEnum.q,
  PiecesEnum.k,
  PiecesEnum.p,
  PiecesEnum.P,
  PiecesEnum.R,
  PiecesEnum.N,
  PiecesEnum.B,
  PiecesEnum.Q,
  PiecesEnum.K,
];

export default class ChessBoard {
  private blackScore: number = 0;
  private whiteScore: number = 0;

  private map: string[] = ["a", "b", "c", "d", "e", "f", "g", "h"];
  private toMove: "b" | "w" = "w";
  private fenPositions: string = "rnbkqbnr/8/8/8/8/8/8/RNBQKBNR";
  private pieces: Piece[] = [];

  constructor() {
    const board = this.fenToBoard();
    this.initPiecesArray(board);

    for (const piece of this.pieces) piece.setOtherPieces(this.pieces);

    out: while (true) {
      console.clear();
      this.renderBoard(board, null);
      console.log(`\n\n${this.toMove === "w" ? "White" : "Black"} to move!`);
      const selection = rs.question("Select a piece, player.\n");

      const selectedPiece = this.pieces.find((v) => v.location === selection);
      if (!selectedPiece) continue;
      if (selectedPiece.color !== this.toMove) continue;

      let valid = false;
      while (!valid) {
        const val = this.movePiece(selectedPiece, board);
        if (val === 1) valid = true;
        else if (val === -1) break;
      }
    }
  }

  public renderBoard(board: string[][], selectedPiece: null | Piece): void {
    let str = "";
    str += `    ${this.map.join("   ")}\n`;
    str += "  ---------------------------------\n";

    for (let i = 0; i < board.length; i++) {

      for (let j = 0; j < board[i].length; j++) {
        if (j === 0) str += `${8 - i} `;
        if (selectedPiece !== null && (selectedPiece.moves as Move[]).map((v) => v.move).includes(cordsToPos([j, 8 - i]))) {
          if (selectedPiece.moves instanceof Array) {
            const cur = selectedPiece.moves.find(v => v.move === cordsToPos([j, 8 - i]));
          
            // castle highlighting big hard maybe no
            /*if (cur && cur.castle) {
              arrOfCastles.push({ castle: cur.castleMove!, king: cur.kingMove! });
              str += `| ${board[i][j]} `;
            } else*/ if (cur && cur.take) str += `|${chalk.bgRed(` ${board[i][j]} `)}`;
            else if (cur && !cur.take) str += `|${chalk.bgGreen(` ${board[i][j]} `)}`;
          }
        } else str += `| ${board[i][j]} `;
        if (j === board[i].length - 1) str += `| ${8 - i}\n`;
      }
      str += "  ---------------------------------\n";
    }

    str += `    ${this.map.join("   ")}\n\nCurrent FEN Position: ${chalk.green(this.fenPositions)}\n\nWhite: ${this.whiteScore} --- Black: ${this.blackScore}`;
    console.log(str);
  }

  private boardToFen(board: string[][]): string {
    const pieces = "rRnNbBqQkKpP";
    let string = "";
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (pieces.includes(board[i][j])) string += board[i][j];
        else if (board[i][j] === " ") string += "1";
        
        if (j === board.length - 1) string += "/";
      }
    }

    const regex = /(\d+)/g;
    const test = string.match(regex);
    for (const s of test as RegExpMatchArray) {
      string = string.replace(s, s.length.toString());
    }

    string = string.slice(0, string.length - 1);
    return string;
  }

  private fenToBoard(): string[][] {
    const board: string[][] = [[]];

    const arr = this.fenPositions.split("");
    let counter: number = 0;
    let lastIValue = 0;

    for (const value of arr) {
      if (value === "/") {
        board.push([]);
        counter++;
        lastIValue = 0;
      } else if (isNaN(parseInt(value))) {
	      board[counter].push(getChar(value));
        lastIValue++;
      } else {
        let i;
        for (i = 0; i < parseInt(value); i++) {
          board[counter].push(" ");
        }

        lastIValue = lastIValue + i;
      }
    }

    return board;
  }

  private initPiecesArray(board: string[][]): void {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (arrPieceTypes.includes(board[i][j])) {
          this.pieces.push(
            new Piece(
              getPiece(board[i][j]),
              cordsToPos([j, 8 - i]),
              board,
              false,
            ),
          );
        }
      }
    }
  }

  private movePiece(piece: Piece, board: string[][]): number {
    console.clear();
    this.renderBoard(board, piece);
    console.log(`\n\n${this.toMove === "w" ? "White" : "Black"} to move!`);

    console.log("Current piece selected: " + piece.location.toUpperCase());
    const moveTo = rs.question("Where do you want to move to? (\"back\" to select a new piece)\n");
    if (moveTo.toLowerCase() === "back") return -1;
    const curCords = posToCords(piece.location);
    const moveCords = posToCords(moveTo);

    if (moveCords.includes(-1)) return this.movePiece(piece, board);

    const validMoves = piece.moves;
    if (validMoves === "check") {

    } else if (validMoves === "checkmate") {

    } else  {
      const onlyMoves = validMoves.map(v => v.move);
      const castleMoves = validMoves.filter(v => v.castle);
      // if (piece.type.toLowerCase() === "k") 
      // if (piece.type === "Q" || piece.type === "q") {
      //   console.log(validMoves);
      //   return -10;
      // }
      if (!onlyMoves.includes(moveTo) && !castleMoves.find(v => v.kingMove![1] === moveTo)) return -1;

      const ptype = board[moveCords[0]][moveCords[1]];
      const takeMove = validMoves.find(v => v.move === moveTo);
      if (takeMove && takeMove.take) {
        this.toMove === "w" ? this.whiteScore += pieceValues[<"p" | "r" | "b" | "n" | "q">ptype.toLowerCase()] : this.blackScore += pieceValues[<"p" | "r" | "b" | "n" | "q">ptype.toLowerCase()];
        this.pieces.splice(this.pieces.findIndex(v => v.location === takeMove.move), 1)
        for (const p of this.pieces) {
          p.setOtherPieces(this.pieces);
        }
      }


      if (castleMoves.length > 0) {
        const move = castleMoves.find((v) => v.kingMove![1] === moveTo);
        if (move) {
          const kingTo = posToCords(move.kingMove![1]);
          const rookTo = posToCords(move.castleMove![1]);

          let rook = "r";
          let king = "k";
          if (this.toMove === "w") {
            rook = rook.toUpperCase();
            king = king.toUpperCase();
          }
          this.setEmpty(posToCords(move.kingMove![0]), board);
          this.setEmpty(posToCords(move.castleMove![0]), board);
          board[kingTo[0]][kingTo[1]] = king;
          board[rookTo[0]][rookTo[1]] = rook;
        }
      }

      board[moveCords[0]][moveCords[1]] = piece.type;
      this.setEmpty(curCords, board);

      piece.location = moveTo;

      this.toMove = this.toMove === "w" ? "b" : "w";

      this.fenPositions = this.boardToFen(board);

      // piece.moved = true;
    }
    return 1;
  }

  private setEmpty(cords: [number, number], board: string[][]): void {
    board[cords[0]][cords[1]] = " ";
  }
}
