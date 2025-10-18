'use client'

import React from 'react'
import { RotateCcw, Undo2, Redo2, Home } from 'lucide-react'

interface GameControlsProps {
  onNewGame: () => void
  onUndo: () => void
  onRedo: () => void
  onFlipBoard: () => void
  canUndo: boolean
  canRedo: boolean
}

export const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onUndo,
  onRedo,
  onFlipBoard,
  canUndo,
  canRedo
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={onNewGame}
        className="flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md"
      >
        <Home className="w-4 h-4" />
        <span>New Game</span>
      </button>
      
      <button
        onClick={onFlipBoard}
        className="flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Flip Board</span>
      </button>
      
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg text-sm font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md"
      >
        <Undo2 className="w-4 h-4" />
        <span>Undo</span>
      </button>
      
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg text-sm font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md"
      >
        <Redo2 className="w-4 h-4" />
        <span>Redo</span>
      </button>
    </div>
  )
}
