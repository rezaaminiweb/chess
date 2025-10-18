'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ChessBoard } from './ChessBoard'
import { GameControls } from './GameControls'
import { MoveHistory } from './MoveHistory'
import { GameState, Move, Color } from '@/lib/types'
import { createInitialGameState, chessToBoard } from '@/lib/chess-utils'
import { Chess } from 'chess.js'

export const ChessGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState())
  const [chess] = useState(() => new Chess())
  const [moveHistory, setMoveHistory] = useState<Move[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [boardFlipped, setBoardFlipped] = useState(false)
  const [gameResult, setGameResult] = useState<{ winner: string | null; reason: string } | null>(null)

  const updateGameState = useCallback(() => {
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
    updateGameState()
  }, [updateGameState])

  const handleMove = useCallback((move: Move) => {
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

        // Update move history
        const newHistory = moveHistory.slice(0, historyIndex + 1)
        newHistory.push(newMove)
        setMoveHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)

        updateGameState()
      }
    } catch (error) {
      console.error('Invalid move:', error)
    }
  }, [chess, moveHistory, historyIndex, updateGameState])

  const handleGameOver = useCallback((result: { winner: string | null; reason: string }) => {
    setGameResult(result)
  }, [])

  const handleNewGame = useCallback(() => {
    chess.reset()
    setMoveHistory([])
    setHistoryIndex(-1)
    setGameResult(null)
    updateGameState()
  }, [chess, updateGameState])

  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
      chess.undo()
      setHistoryIndex(historyIndex - 1)
      updateGameState()
    }
  }, [chess, historyIndex, updateGameState])

  const handleRedo = useCallback(() => {
    if (historyIndex < moveHistory.length - 1) {
      const nextMove = moveHistory[historyIndex + 1]
      chess.move({
        from: nextMove.from,
        to: nextMove.to,
        promotion: nextMove.promotion || 'q'
      })
      setHistoryIndex(historyIndex + 1)
      updateGameState()
    }
  }, [chess, historyIndex, moveHistory, updateGameState])

  const handleFlipBoard = useCallback(() => {
    setBoardFlipped(!boardFlipped)
  }, [boardFlipped])

  const handleMoveClick = useCallback((index: number) => {
    // Reset to the position at the given move index
    chess.reset()
    for (let i = 0; i <= index; i++) {
      const move = moveHistory[i]
      chess.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || 'q'
      })
    }
    setHistoryIndex(index)
    updateGameState()
  }, [chess, moveHistory, updateGameState])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <div className="flex-shrink-0 text-center py-6 bg-gradient-to-r from-black/20 to-purple-900/20 backdrop-blur-md border-b border-white/10 shadow-2xl">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-2">
            ♔ 3D Chess Game ♛
          </h1>
          <p className="text-sm text-purple-200 font-medium">Play chess with stunning 3D effects and drag & drop</p>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
          {/* Chess Board */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className={`transform transition-transform duration-500 ${boardFlipped ? 'rotate-180' : ''} w-full h-full max-w-full max-h-full flex items-center justify-center`}>
              <div className="relative transform hover:scale-105 transition-transform duration-300">
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
                canUndo={historyIndex >= 0}
                canRedo={historyIndex < moveHistory.length - 1}
              />
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
