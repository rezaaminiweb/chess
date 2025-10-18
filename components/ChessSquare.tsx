'use client'

import React from 'react'
import { useDrag } from 'react-dnd'
import { Piece, Square, Color } from '@/lib/types'
import { getPieceSymbol } from '@/lib/chess-utils'

interface ChessSquareProps {
  square: Square
  piece: Piece | null
  isLight: boolean
  isSelected: boolean
  isPossibleMove: boolean
  isHighlighted: boolean
  onClick: () => void
  onDrop: (fromSquare: Square) => void
  currentPlayer: Color
}

export const ChessSquare: React.FC<ChessSquareProps> = ({
  square,
  piece,
  isLight,
  isSelected,
  isPossibleMove,
  isHighlighted,
  onClick,
  onDrop,
  currentPlayer
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'piece',
    item: { from: square },
    canDrag: () => piece !== null && piece.color === currentPlayer,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const fromSquare = e.dataTransfer.getData('text/plain') as Square
    onDrop(fromSquare)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (piece && piece.color === currentPlayer) {
      e.dataTransfer.setData('text/plain', square)
      e.dataTransfer.effectAllowed = 'move'
    }
  }

  const squareClasses = [
    'chess-square',
    isLight ? 'light' : 'dark',
    isSelected && 'highlighted',
    isPossibleMove && 'possible-move',
    isDragging && 'opacity-50'
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={piece && piece.color === currentPlayer ? (drag as any) : undefined}
      className={squareClasses}
      onClick={onClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      draggable={piece !== null && piece.color === currentPlayer}
    >
      {piece && (
        <span 
          className="chess-piece"
          data-piece={piece.type.toUpperCase()}
        >
          {getPieceSymbol(piece)}
        </span>
      )}
      {isPossibleMove && !piece && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-90 shadow-lg animate-pulse border-2 border-white/50" />
        </div>
      )}
      {isPossibleMove && piece && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400/60 to-green-600/60 rounded-full opacity-80 shadow-lg animate-pulse border-2 border-white/70" />
        </div>
      )}
    </div>
  )
}
