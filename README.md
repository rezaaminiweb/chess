# Chess Game

A full-stack chess game built with Next.js, TypeScript, and Tailwind CSS. Features drag-and-drop piece movement, move validation, game history, and a modern responsive UI.

## Features

- 🎯 **Interactive Chess Board**: Click or drag pieces to make moves
- ✅ **Move Validation**: All moves are validated using chess.js
- 📜 **Move History**: View and navigate through game history
- 🔄 **Undo/Redo**: Undo and redo moves
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 🎮 **Game Controls**: New game, flip board, and other controls
- ♟️ **Complete Chess Logic**: Check, checkmate, stalemate detection

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Chess Logic**: chess.js
- **Drag & Drop**: react-dnd
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd chess
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Play

1. **Making Moves**: Click on a piece and then click on a destination square, or drag and drop pieces
2. **Game Controls**:
   - **New Game**: Start a fresh game
   - **Undo**: Undo the last move
   - **Redo**: Redo a previously undone move
   - **Flip Board**: Rotate the board 180 degrees
3. **Move History**: Click on any move in the history to jump to that position
4. **Game Status**: The game will show check, checkmate, and stalemate conditions

## Project Structure

```
chess/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── game/         # Game-related endpoints
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ChessBoard.tsx    # Main chess board component
│   ├── ChessGame.tsx     # Game container component
│   ├── ChessSquare.tsx   # Individual square component
│   ├── GameControls.tsx  # Game control buttons
│   └── MoveHistory.tsx   # Move history display
├── lib/                   # Utility functions
│   ├── types.ts          # TypeScript type definitions
│   └── chess-utils.ts    # Chess-related utilities
└── package.json          # Dependencies and scripts
```

## API Endpoints

- `GET /api/game` - Get initial game state
- `POST /api/game` - Make a move
- `POST /api/game/validate` - Validate a move

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding Features

The codebase is well-structured and modular. To add new features:

1. **New Components**: Add to the `components/` directory
2. **New Utilities**: Add to the `lib/` directory
3. **New API Routes**: Add to the `app/api/` directory
4. **Types**: Update `lib/types.ts`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
