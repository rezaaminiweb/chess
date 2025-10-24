import { NextApiRequest, NextApiResponse } from 'next'
import { initializeSocket, NextApiResponseServerIO } from '@/lib/socket'

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = initializeSocket(res.socket.server)
    res.socket.server.io = io
  }
  res.end()
}
