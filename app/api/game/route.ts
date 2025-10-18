import { NextRequest, NextResponse } from 'next/server'
import { Chess } from 'chess.js'
import { createInitialGameState, chessToBoard } from '@/lib/chess-utils'

export async function GET() {
  try {
    const gameState = createInitialGameState()
    return NextResponse.json({ success: true, gameState })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create game' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fen, move } = await request.json()
    
    if (!fen || !move) {
      return NextResponse.json(
        { success: false, error: 'Missing FEN or move data' },
        { status: 400 }
      )
    }

    const chess = new Chess(fen)
    const moveResult = chess.move(move)
    
    if (!moveResult) {
      return NextResponse.json(
        { success: false, error: 'Invalid move' },
        { status: 400 }
      )
    }

    const newGameState = {
      board: chessToBoard(chess),
      turn: chess.turn(),
      inCheck: chess.isCheck(),
      checkmate: chess.isCheckmate(),
      stalemate: chess.isStalemate(),
      fen: chess.fen(),
      pgn: chess.pgn()
    }

    return NextResponse.json({ 
      success: true, 
      gameState: newGameState,
      move: moveResult
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process move' },
      { status: 500 }
    )
  }
}
