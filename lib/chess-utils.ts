import { Chess } from 'chess.js'
import { Piece, PieceType, Color, Square, Move, GameState } from './types'

export const PIECE_SYMBOLS: Record<string, string> = {
  'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
  'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟'
}

export const SQUARE_NAMES = [
  'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
  'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
  'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
  'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
  'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
  'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
  'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
  'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
]

export function squareToIndex(square: Square): { row: number; col: number } {
  const file = square.charCodeAt(0) - 97 // 'a' = 0, 'b' = 1, etc.
  const rank = 8 - parseInt(square[1]) // '8' = 0, '7' = 1, etc.
  return { row: rank, col: file }
}

export function indexToSquare(row: number, col: number): Square {
  const file = String.fromCharCode(97 + col)
  const rank = 8 - row
  return `${file}${rank}` as Square
}

export function isLightSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 0
}

export function getPieceSymbol(piece: Piece | null): string {
  if (!piece) return ''
  const key = `${piece.color}${piece.type.toUpperCase()}`
  return PIECE_SYMBOLS[key] || ''
}

export function createInitialGameState(): GameState {
  const chess = new Chess()
  return {
    board: chessToBoard(chess),
    turn: 'w',
    inCheck: chess.isCheck(),
    checkmate: chess.isCheckmate(),
    stalemate: chess.isStalemate(),
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    possibleMoves: [],
    selectedSquare: null
  }
}

export function chessToBoard(chess: Chess): (Piece | null)[][] {
  const board: (Piece | null)[][] = []
  
  for (let row = 0; row < 8; row++) {
    board[row] = []
    for (let col = 0; col < 8; col++) {
      const square = indexToSquare(row, col)
      const piece = chess.get(square as any)
      
      if (piece) {
        board[row][col] = {
          type: piece.type as PieceType,
          color: piece.color as Color
        }
      } else {
        board[row][col] = null
      }
    }
  }
  
  return board
}

export function getPossibleMoves(chess: Chess, square: Square): Square[] {
  const moves = chess.moves({ square: square as any, verbose: true })
  return moves.map((move: any) => move.to as Square)
}

export function makeMove(chess: Chess, from: Square, to: Square, promotion?: PieceType): boolean {
  try {
    const move = chess.move({
      from: from as any,
      to: to as any,
      promotion: promotion || 'q'
    })
    return !!move
  } catch (error) {
    return false
  }
}

export function isGameOver(chess: Chess): boolean {
  return chess.isGameOver()
}

export function getGameResult(chess: Chess): { winner: Color | null; reason: string } {
  if (chess.isCheckmate()) {
    return { winner: chess.turn() === 'w' ? 'b' : 'w', reason: 'checkmate' }
  }
  if (chess.isStalemate()) {
    return { winner: null, reason: 'stalemate' }
  }
  if (chess.isDraw()) {
    return { winner: null, reason: 'draw' }
  }
  return { winner: null, reason: 'ongoing' }
}
