import { Piece } from "../Piece/Piece";

export default interface Move {
    take: boolean;
    move: string;
    takenPiece?: Piece;
    castle?: boolean;
    kingMove?: string[];
    castleMove?: string[];
}