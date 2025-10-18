'use client'

import React, { useState, useCallback } from 'react'
import { useDrop } from 'react-dnd'
import { ChessSquare } from '@/components/ChessSquare'
import { GameState, Square, Move } from '@/lib/types'
import { 
  squareToIndex, 
  indexToSquare, 
  isLightSquare, 
  getPossibleMoves,
  makeMove,
  isGameOver,
  getGameResult
} from '@/lib/chess-utils'
import { Chess } from 'chess.js'

interface ChessBoardProps {
  gameState: GameState
  onMove: (move: Move) => void
  onGameOver: (result: { winner: string | null; reason: string }) => void
}

export const ChessBoard: React.FC<ChessBoardProps> = ({ 
  gameState, 
  onMove, 
  onGameOver 
}) => {
  const [chess] = useState(() => new Chess())
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([])

  const handleSquareClick = useCallback((square: Square) => {
    const piece = gameState.board[squareToIndex(square).row][squareToIndex(square).col]
    
    // If clicking on a piece of the current player's color
    if (piece && piece.color === gameState.turn) {
      // If clicking on the same piece, deselect it
      if (selectedSquare === square) {
        setSelectedSquare(null)
        setPossibleMoves([])
      } else {
        setSelectedSquare(square)
        const moves = getPossibleMoves(chess, square)
        setPossibleMoves(moves)
      }
    } 
    // If a square is selected and clicking on a possible move
    else if (selectedSquare && possibleMoves.includes(square)) {
      const move: Move = { from: selectedSquare, to: square }
      
      if (makeMove(chess, selectedSquare, square)) {
        onMove(move)
        
        // Check if game is over
        if (isGameOver(chess)) {
          const result = getGameResult(chess)
          onGameOver(result)
        }
      }
      
      setSelectedSquare(null)
      setPossibleMoves([])
    }
    // If clicking on an empty square or opponent's piece, deselect
    else {
      setSelectedSquare(null)
      setPossibleMoves([])
    }
  }, [gameState, selectedSquare, possibleMoves, chess, onMove, onGameOver])

  const handleDrop = useCallback((item: { from: Square }, targetSquare: Square) => {
    if (makeMove(chess, item.from, targetSquare)) {
      const move: Move = { from: item.from, to: targetSquare }
      onMove(move)
      
      // Check if game is over
      if (isGameOver(chess)) {
        const result = getGameResult(chess)
        onGameOver(result)
      }
    }
    
    setSelectedSquare(null)
    setPossibleMoves([])
  }, [chess, onMove, onGameOver])

  const [, drop] = useDrop({
    accept: 'piece',
    drop: (item: { from: Square }) => {
      // This will be handled by individual squares
    },
  })

  return (
    <div className="flex flex-col items-center space-y-4 w-full h-full">
      <div className="chess-board">
        {Array.from({ length: 8 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => {
            const square = indexToSquare(row, col)
            const piece = gameState.board[row][col]
            const isLight = isLightSquare(row, col)
            const isSelected = selectedSquare === square
            const isPossibleMove = possibleMoves.includes(square)
            const isHighlighted = isSelected || isPossibleMove
            
            return (
              <ChessSquare
                key={square}
                square={square}
                piece={piece}
                isLight={isLight}
                isSelected={isSelected}
                isPossibleMove={isPossibleMove}
                isHighlighted={isHighlighted}
                onClick={() => handleSquareClick(square)}
                onDrop={(fromSquare: Square) => handleDrop({ from: fromSquare }, square)}
                currentPlayer={gameState.turn}
              />
            )
          })
        )}
      </div>
      
      {/* Game status */}
      <div className="text-center">
        <p className="text-lg font-semibold">
          {gameState.turn === 'w' ? 'White' : 'Black'} to move
        </p>
        {gameState.inCheck && (
          <p className="text-red-600 font-bold">Check!</p>
        )}
        {gameState.checkmate && (
          <p className="text-red-600 font-bold">
            Checkmate! {gameState.turn === 'w' ? 'Black' : 'White'} wins!
          </p>
        )}
        {gameState.stalemate && (
          <p className="text-yellow-600 font-bold">Stalemate!</p>
        )}
      </div>
    </div>
  )
}
