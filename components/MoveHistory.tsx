'use client'

import React from 'react'
import { Move } from '@/lib/types'

interface MoveHistoryProps {
  moves: Move[]
  currentMoveIndex: number
  onMoveClick: (index: number) => void
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  currentMoveIndex,
  onMoveClick
}) => {
  const formatMove = (move: Move, index: number): string => {
    const moveNumber = Math.floor(index / 2) + 1
    const isWhiteMove = index % 2 === 0
    const prefix = isWhiteMove ? `${moveNumber}.` : ''
    return `${prefix} ${move.from}-${move.to}`
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-4 h-full flex flex-col border border-gray-200">
      <h3 className="text-sm font-bold mb-3 text-gray-800 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Move History</h3>
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {moves.map((move, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg cursor-pointer transition-all duration-300 font-mono text-xs font-medium ${
              index === currentMoveIndex
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:shadow-md hover:-translate-y-0.5'
            }`}
            onClick={() => onMoveClick(index)}
          >
            <span>
              {formatMove(move, index)}
            </span>
          </div>
        ))}
        {moves.length === 0 && (
          <p className="text-gray-500 text-xs text-center py-4 italic">No moves yet</p>
        )}
      </div>
    </div>
  )
}
