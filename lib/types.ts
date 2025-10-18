export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k'
export type Color = 'w' | 'b'
export type Square = string // e.g., 'e4', 'a1'

export interface Piece {
  type: PieceType
  color: Color
}

export interface Move {
  from: Square
  to: Square
  promotion?: PieceType
  san?: string // Standard Algebraic Notation
}

export interface GameState {
  board: (Piece | null)[][]
  turn: Color
  inCheck: boolean
  checkmate: boolean
  stalemate: boolean
  moveHistory: Move[]
  capturedPieces: { white: PieceType[], black: PieceType[] }
  possibleMoves: Square[]
  selectedSquare: Square | null
}

export interface GameResult {
  winner: Color | null
  reason: 'checkmate' | 'stalemate' | 'resignation' | null
}
