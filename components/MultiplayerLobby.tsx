'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Plus, Users, Clock, Play } from 'lucide-react'

interface Game {
  id: string
  status: string
  createdAt: string
  whitePlayer: {
    id: string
    username: string
    email: string
  }
  blackPlayer?: {
    id: string
    username: string
    email: string
  }
}

interface MultiplayerLobbyProps {
  onJoinGame: (gameId: string) => void
  onCreateGame: () => void
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ onJoinGame, onCreateGame }) => {
  const { user, token } = useAuth()
  const [availableGames, setAvailableGames] = useState<Game[]>([])
  const [userGames, setUserGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGames = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/games/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableGames(data.availableGames)
        setUserGames(data.userGames)
      }
    } catch (error) {
      console.error('Failed to fetch games:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
    const interval = setInterval(fetchGames, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [token])

  const handleCreateGame = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/games/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // For now, just go to lobby mode
        onCreateGame()
        fetchGames() // Refresh the list
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to create game')
      }
    } catch (error) {
      console.error('Failed to create game:', error)
      alert('Failed to create game. Please try again.')
    }
  }

  const handleJoinGame = async (gameId: string) => {
    if (!token) return

    try {
      const response = await fetch('/api/games/join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gameId })
      })

      if (response.ok) {
        onJoinGame(gameId)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to join game')
      }
    } catch (error) {
      console.error('Failed to join game:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading games...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Multiplayer Lobby</h2>
        <button
          onClick={handleCreateGame}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>Create Game</span>
        </button>
      </div>

      {/* User's Games */}
      {userGames.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Your Games</h3>
          <div className="grid gap-3">
            {userGames.map((game) => (
              <div
                key={game.id}
                className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-4 border border-slate-600"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">
                      vs {game.whitePlayer.id === user?.id ? game.blackPlayer?.username || 'Waiting...' : game.whitePlayer.username}
                    </div>
                    <div className="text-slate-400 text-sm">
                      Status: {game.status === 'WAITING' ? 'Waiting for opponent' : 'In Progress'}
                    </div>
                  </div>
                  <button
                    onClick={() => onJoinGame(game.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    {game.status === 'WAITING' ? 'Wait' : 'Continue'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Games */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Available Games</h3>
        {availableGames.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No games available. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {availableGames.map((game) => (
              <div
                key={game.id}
                className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">
                      vs {game.whitePlayer.username}
                    </div>
                    <div className="text-slate-400 text-sm flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Created {new Date(game.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinGame(game.id)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
                  >
                    <Play className="w-4 h-4" />
                    <span>Join</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
