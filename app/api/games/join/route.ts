import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { gameId } = await request.json()

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    // Find the game
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        whitePlayer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        blackPlayer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    })

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    if (game.status !== 'WAITING') {
      return NextResponse.json(
        { error: 'Game is not available to join' },
        { status: 400 }
      )
    }

    if (game.whitePlayerId === user.id) {
      return NextResponse.json(
        { error: 'You cannot join your own game' },
        { status: 400 }
      )
    }

    // Update the game to assign black player and start
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        blackPlayerId: user.id,
        status: 'IN_PROGRESS'
      },
      include: {
        whitePlayer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        blackPlayer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      game: updatedGame
    })
  } catch (error) {
    console.error('Join game error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
