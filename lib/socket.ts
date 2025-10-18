import { Server as NetServer } from 'http'
import { NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import { verifyToken, UserPayload } from './auth'
import { prisma } from './db'
import { Chess } from 'chess.js'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}

export interface GameRoom {
  gameId: string
  players: Map<string, UserPayload>
  chess: Chess
  currentPlayer: 'w' | 'b'
}

const gameRooms = new Map<string, GameRoom>()

export function initializeSocket(server: NetServer) {
  const io = new ServerIO(server, {
    path: '/api/socket',
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
      methods: ['GET', 'POST']
    }
  })

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Authentication error'))
      }

      const user = verifyToken(token)
      if (!user) {
        return next(new Error('Authentication error'))
      }

      socket.data.user = user
      next()
    } catch (err) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.data.user as UserPayload
    console.log(`User ${user.username} connected`)

    // Join game room
    socket.on('join-game', async (gameId: string) => {
      try {
        // Verify user has access to this game
        const game = await prisma.game.findUnique({
          where: { id: gameId },
          include: {
            whitePlayer: true,
            blackPlayer: true
          }
        })

        if (!game) {
          socket.emit('error', { message: 'Game not found' })
          return
        }

        if (game.whitePlayerId !== user.id && game.blackPlayerId !== user.id) {
          socket.emit('error', { message: 'Access denied' })
          return
        }

        // Join socket room
        socket.join(gameId)

        // Initialize or get game room
        if (!gameRooms.has(gameId)) {
          const chess = new Chess(game.currentFen)
          gameRooms.set(gameId, {
            gameId,
            players: new Map(),
            chess,
            currentPlayer: chess.turn()
          })
        }

        const room = gameRooms.get(gameId)!
        room.players.set(user.id, user)

        // Notify all players in the room
        io.to(gameId).emit('player-joined', {
          user,
          players: Array.from(room.players.values()),
          gameState: {
            fen: room.chess.fen(),
            turn: room.chess.turn(),
            inCheck: room.chess.isCheck(),
            checkmate: room.chess.isCheckmate(),
            stalemate: room.chess.isStalemate()
          }
        })

        // Send current game state to the joining player
        socket.emit('game-state', {
          fen: room.chess.fen(),
          turn: room.chess.turn(),
          inCheck: room.chess.isCheck(),
          checkmate: room.chess.isCheckmate(),
          stalemate: room.chess.isStalemate(),
          players: Array.from(room.players.values())
        })

      } catch (error) {
        console.error('Join game error:', error)
        socket.emit('error', { message: 'Failed to join game' })
      }
    })

    // Handle move
    socket.on('make-move', async (data: { gameId: string; from: string; to: string; promotion?: string }) => {
      try {
        const { gameId, from, to, promotion } = data
        const room = gameRooms.get(gameId)

        if (!room) {
          socket.emit('error', { message: 'Game room not found' })
          return
        }

        // Check if it's the player's turn
        const isWhitePlayer = room.chess.turn() === 'w'
        const isUserWhite = room.chess.turn() === 'w' && 
          Array.from(room.players.values()).some(p => p.id === user.id && 
            room.chess.turn() === 'w')

        // Verify it's the player's turn
        const game = await prisma.game.findUnique({
          where: { id: gameId }
        })

        if (!game) {
          socket.emit('error', { message: 'Game not found' })
          return
        }

        const isPlayerTurn = (room.chess.turn() === 'w' && game.whitePlayerId === user.id) ||
                           (room.chess.turn() === 'b' && game.blackPlayerId === user.id)

        if (!isPlayerTurn) {
          socket.emit('error', { message: 'Not your turn' })
          return
        }

        // Make the move
        const move = room.chess.move({
          from,
          to,
          promotion: promotion || 'q'
        })

        if (!move) {
          socket.emit('error', { message: 'Invalid move' })
          return
        }

        // Save move to database
        await prisma.gameMove.create({
          data: {
            gameId,
            playerId: user.id,
            move: move.san,
            from,
            to,
            fen: room.chess.fen(),
            moveNumber: room.chess.history().length
          }
        })

        // Update game in database
        await prisma.game.update({
          where: { id: gameId },
          data: {
            currentFen: room.chess.fen(),
            status: room.chess.isGameOver() ? 'FINISHED' : 'IN_PROGRESS',
            winner: room.chess.isCheckmate() ? 
              (room.chess.turn() === 'w' ? game.blackPlayerId : game.whitePlayerId) : null
          }
        })

        // Broadcast move to all players in the room
        io.to(gameId).emit('move-made', {
          move: {
            from,
            to,
            san: move.san,
            fen: room.chess.fen()
          },
          gameState: {
            fen: room.chess.fen(),
            turn: room.chess.turn(),
            inCheck: room.chess.isCheck(),
            checkmate: room.chess.isCheckmate(),
            stalemate: room.chess.isStalemate()
          },
          player: user
        })

        // If game is over, clean up room
        if (room.chess.isGameOver()) {
          gameRooms.delete(gameId)
        }

      } catch (error) {
        console.error('Make move error:', error)
        socket.emit('error', { message: 'Failed to make move' })
      }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${user.username} disconnected`)
      
      // Remove user from all game rooms
      for (const [gameId, room] of gameRooms.entries()) {
        if (room.players.has(user.id)) {
          room.players.delete(user.id)
          
          // Notify other players
          socket.to(gameId).emit('player-left', {
            user,
            players: Array.from(room.players.values())
          })

          // Clean up empty rooms
          if (room.players.size === 0) {
            gameRooms.delete(gameId)
          }
        }
      }
    })
  })

  return io
}
