'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AuthModal } from '@/components/AuthModal'
import { MultiplayerLobby } from '@/components/MultiplayerLobby'
import { MultiplayerChessGame } from '@/components/MultiplayerChessGame'
import { ChessGame } from '@/components/ChessGame'
import { LogOut, User, Gamepad2, Users } from 'lucide-react'

type GameMode = 'single' | 'multiplayer' | 'lobby'
type AuthMode = 'login' | 'register'

export default function Home() {
  const { user, logout, loading } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [gameMode, setGameMode] = useState<GameMode>('single')
  const [currentGameId, setCurrentGameId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-4">
            ♔ 3D Chess Game ♛
          </h1>
          <p className="text-purple-200 text-lg">Play chess with stunning 3D effects and multiplayer support</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => {
              setAuthMode('login')
              setAuthModalOpen(true)
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthMode('register')
              setAuthModalOpen(true)
            }}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Create Account
          </button>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          mode={authMode}
          onModeChange={setAuthMode}
        />
      </div>
    )
  }

  const handleJoinGame = (gameId: string) => {
    setCurrentGameId(gameId)
    setGameMode('multiplayer')
  }

  const handleCreateGame = () => {
    setGameMode('lobby')
  }

  const handleBackToLobby = () => {
    setCurrentGameId(null)
    setGameMode('lobby')
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-black/20 to-purple-900/20 backdrop-blur-md border-b border-white/10 shadow-2xl">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center space-x-2 lg:space-x-4">
            <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              ♔ 3D Chess ♛
            </h1>
            <div className="hidden lg:flex items-center space-x-2 text-purple-200">
              <User className="w-4 h-4" />
              <span>{user.username}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            {gameMode === 'single' && (
              <button
                onClick={() => setGameMode('lobby')}
                className="flex items-center space-x-1 lg:space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-2 lg:px-4 py-2 rounded-lg transition-all duration-300 text-sm lg:text-base"
              >
                <Users className="w-4 h-4" />
                <span className="hidden lg:inline">Multiplayer</span>
              </button>
            )}
            {gameMode === 'lobby' && (
              <button
                onClick={() => setGameMode('single')}
                className="flex items-center space-x-1 lg:space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-2 lg:px-4 py-2 rounded-lg transition-all duration-300 text-sm lg:text-base"
              >
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden lg:inline">Single Player</span>
              </button>
            )}
            <button
              onClick={logout}
              className="flex items-center space-x-1 lg:space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-2 lg:px-4 py-2 rounded-lg transition-all duration-300 text-sm lg:text-base"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {gameMode === 'single' && <ChessGame />}
        {gameMode === 'lobby' && (
          <div className="h-full p-6">
            <MultiplayerLobby
              onJoinGame={handleJoinGame}
              onCreateGame={handleCreateGame}
            />
          </div>
        )}
        {gameMode === 'multiplayer' && currentGameId && (
          <MultiplayerChessGame
            gameId={currentGameId}
            onBackToLobby={handleBackToLobby}
          />
        )}
      </div>
    </div>
  )
}
