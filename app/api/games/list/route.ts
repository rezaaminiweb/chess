import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get available games (waiting for players)
    const availableGames = await prisma.game.findMany({
      where: {
        status: 'WAITING',
        whitePlayerId: {
          not: user.id // Don't show user's own games
        }
      },
      include: {
        whitePlayer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get user's active games
    const userGames = await prisma.game.findMany({
      where: {
        OR: [
          { whitePlayerId: user.id },
          { blackPlayerId: user.id }
        ],
        status: {
          in: ['IN_PROGRESS', 'WAITING']
        }
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      availableGames,
      userGames
    })
  } catch (error) {
    console.error('List games error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
