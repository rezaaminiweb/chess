'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ChessBoard } from './ChessBoard'
import { GameControls } from './GameControls'
import { MoveHistory } from './MoveHistory'
import { useAuth } from '@/lib/auth-context'
import { GameState, Move } from '@/lib/types'
import { createInitialGameState, chessToBoard } from '@/lib/chess-utils'
import { Chess } from 'chess.js'

interface MultiplayerChessGameProps {
  gameId: string
  onBackToLobby: () => void
}

export const MultiplayerChessGame: React.FC<MultiplayerChessGameProps> = ({ 
  gameId, 
  onBackToLobby 
}) => {
  const { user, token } = useAuth()
  const [gameState, setGameState] = useState<GameState>(createInitialGameState())
  const [chess] = useState(() => new Chess())
  const [moveHistory, setMoveHistory] = useState<Move[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [boardFlipped, setBoardFlipped] = useState(false)
  const [gameResult, setGameResult] = useState<{ winner: string | null; reason: string } | null>(null)
  const [players, setPlayers] = useState<any[]>([
    { id: user?.id, username: user?.username, email: user?.email }
  ])
  const [isConnected, setIsConnected] = useState(true)

  const updateGameState = useCallback((fen: string) => {
    chess.load(fen)
    setGameState({
      board: chessToBoard(chess),
      turn: chess.turn(),
      inCheck: chess.isCheck(),
      checkmate: chess.isCheckmate(),
      stalemate: chess.isStalemate(),
      moveHistory: moveHistory,
      capturedPieces: { white: [], black: [] },
      possibleMoves: [],
      selectedSquare: null
    })
  }, [chess, moveHistory])

  useEffect(() => {
    // For now, we'll implement a simple multiplayer without real-time sockets
    // This will be a placeholder until we fix the Socket.IO issues
    console.log('Multiplayer game initialized for game:', gameId)
    setIsConnected(true)
  }, [gameId])

  const handleMove = useCallback((move: Move) => {
    if (!isConnected) return

    // For now, just make the move locally
    // TODO: Implement proper multiplayer move handling
    try {
      const moveResult = chess.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || 'q'
      })

      if (moveResult) {
        const newMove: Move = {
          from: move.from,
          to: move.to,
          promotion: move.promotion,
          san: moveResult.san
        }

        const newHistory = [...moveHistory, newMove]
        setMoveHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)

        updateGameState(chess.fen())

        if (chess.isGameOver()) {
          const result = chess.isCheckmate() ? 
            { winner: chess.turn() === 'w' ? 'b' : 'w', reason: 'checkmate' } :
            { winner: null, reason: 'stalemate' }
          setGameResult(result)
        }
      }
    } catch (error) {
      console.error('Invalid move:', error)
    }
  }, [isConnected, chess, moveHistory, updateGameState])

  const handleGameOver = useCallback((result: { winner: string | null; reason: string }) => {
    setGameResult(result)
  }, [])

  const handleNewGame = useCallback(() => {
    // In multiplayer, this would typically mean resigning
    onBackToLobby()
  }, [onBackToLobby])

  const handleUndo = useCallback(() => {
    // Undo not available in multiplayer
    alert('Undo is not available in multiplayer games')
  }, [])

  const handleRedo = useCallback(() => {
    // Redo not available in multiplayer
    alert('Redo is not available in multiplayer games')
  }, [])

  const handleFlipBoard = useCallback(() => {
    setBoardFlipped(!boardFlipped)
  }, [boardFlipped])

  const handleMoveClick = useCallback((index: number) => {
    // Move navigation not available in multiplayer
    alert('Move navigation is not available in multiplayer games')
  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <div className="flex-shrink-0 text-center py-6 bg-gradient-to-r from-black/20 to-purple-900/20 backdrop-blur-md border-b border-white/10 shadow-2xl">
          <div className="flex items-center justify-between px-6">
            <button
              onClick={onBackToLobby}
              className="text-purple-200 hover:text-white transition-colors"
            >
              ← Back to Lobby
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-1">
                ♔ Multiplayer Chess ♛
              </h1>
              <div className="flex items-center justify-center space-x-4 text-sm text-purple-200">
                <div className={`flex items-center space-x-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
                <span>Game ID: {gameId.slice(0, 8)}...</span>
              </div>
            </div>
            <div className="text-right text-sm text-purple-200">
              <div>Players: {players.length}/2</div>
              <div>Your turn: {gameState.turn === 'w' ? 'White' : 'Black'}</div>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-6 overflow-hidden">
          {/* Chess Board */}
          <div className="flex-1 flex items-center justify-center min-h-0 w-full">
            <div className={`transform transition-transform duration-500 ${boardFlipped ? 'rotate-180' : ''} w-full h-full flex items-center justify-center`}>
              <div className="relative transform hover:scale-105 transition-transform duration-300 w-full h-full flex items-center justify-center">
                {/* Board Shadow */}
                <div className="absolute inset-0 bg-black/30 rounded-2xl blur-xl scale-110 -z-10"></div>
                <ChessBoard
                  gameState={gameState}
                  onMove={handleMove}
                  onGameOver={handleGameOver}
                />
              </div>
            </div>
          </div>

          {/* Game Info Panel */}
          <div className="flex-shrink-0 w-full lg:w-80 flex flex-col space-y-6 max-h-full overflow-hidden">
            {/* Game Controls */}
            <div className="flex-shrink-0">
              <GameControls
                onNewGame={handleNewGame}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onFlipBoard={handleFlipBoard}
                canUndo={false}
                canRedo={false}
              />
            </div>

            {/* Players */}
            <div className="flex-shrink-0 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-4 border border-gray-200">
              <h3 className="text-sm font-bold mb-3 text-gray-800">Players</h3>
              <div className="space-y-2">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-2 rounded-lg ${
                      player.id === user?.id 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{player.username}</div>
                    <div className="text-xs opacity-75">
                      {index === 0 ? 'White' : 'Black'} • {player.id === user?.id ? 'You' : 'Opponent'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Status */}
            {gameResult && (
              <div className="flex-shrink-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-2xl p-4 border border-yellow-300">
                <h3 className="text-lg font-bold mb-2 text-white">🎉 Game Over!</h3>
                <p className="text-white font-medium">
                  {gameResult.winner 
                    ? `${gameResult.winner === 'w' ? 'White' : 'Black'} wins by ${gameResult.reason}!`
                    : `Game ended in ${gameResult.reason}`
                  }
                </p>
              </div>
            )}

            {/* Move History */}
            <div className="flex-1 min-h-0">
              <MoveHistory
                moves={moveHistory}
                currentMoveIndex={historyIndex}
                onMoveClick={handleMoveClick}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}
