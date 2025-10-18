import { NextRequest, NextResponse } from 'next/server'
import { Chess } from 'chess.js'

export async function POST(request: NextRequest) {
  try {
    const { fen, from, to } = await request.json()
    
    if (!fen || !from || !to) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const chess = new Chess(fen)
    const moves = chess.moves({ square: from, verbose: true })
    const isValidMove = moves.some(move => move.to === to)

    if (isValidMove) {
      const move = chess.move({ from, to })
      return NextResponse.json({
        success: true,
        valid: true,
        move,
        newFen: chess.fen(),
        inCheck: chess.isCheck(),
        checkmate: chess.isCheckmate(),
        stalemate: chess.isStalemate()
      })
    } else {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Invalid move'
      })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to validate move' },
      { status: 500 }
    )
  }
}
