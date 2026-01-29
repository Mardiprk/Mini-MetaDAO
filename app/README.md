# Mini Meta DAO Frontend

A Next.js frontend for the Mini Meta DAO Solana protocol - a futarchy-based governance system using prediction markets.

## Features

- 🎯 **Proposal Management**: Create and view governance proposals
- 📊 **Prediction Markets**: Trade YES/NO shares on proposal outcomes
- 💰 **Market Resolution**: Admin-controlled market resolution and proposal execution
- 🏆 **Redeem Winnings**: Claim rewards from winning positions
- 🌙 **Dark Theme**: Professional, protocol-grade UI with gradient accents
- 🔐 **Wallet Integration**: Phantom and Solflare wallet support

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Solana Web3.js
- Anchor Framework
- Wallet Adapter

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Phantom or Solflare wallet
- Solana devnet SOL (for testing)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with wallet provider
│   ├── page.tsx           # Dashboard with proposal grid
│   └── proposal/[id]/     # Proposal detail pages
├── src/
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks for blockchain data
│   ├── lib/               # Utilities (Anchor, PDAs, types)
│   └── idl/               # Program IDL
```

## Usage

### Connect Wallet

1. Click "Connect Wallet" in the navbar
2. Select Phantom or Solflare
3. Approve the connection

### Create a Proposal

1. Click "Create Proposal" on the dashboard
2. Enter a description
3. Submit the transaction

### Trade on Markets

1. Navigate to a proposal with an active market
2. Enter the amount of SOL to trade
3. Click "Buy YES" or "Buy NO"
4. Confirm the transaction

### Redeem Winnings

1. Navigate to a resolved market where you have a winning position
2. Click "Redeem Winnings"
3. Confirm the transaction

### Admin Actions (DAO Admin Only)

- **Resolve Market**: Choose YES or NO outcome after market closes
- **Execute Proposal**: Transfer SOL and tokens from treasury

## Environment

- **Network**: Solana Devnet
- **Program ID**: `BRrZTP9GnkFpGfbXjeG754X2NdKZN4h2rkfgtX9kPMWV`
- **RPC Endpoint**: `https://api.devnet.solana.com`

## Design

The UI follows a dark-first, protocol-grade aesthetic inspired by Jupiter, Drift, and Backpack:

- **Colors**: Blue/violet gradients on black background
- **Typography**: Inter font (semi-bold for headings, regular for text)
- **Components**: Rounded cards, soft shadows, subtle gradients
- **Interactions**: Smooth hover effects and transitions

## Development

```bash
# Run development server with hot reload
npm run dev

# Type check
npm run build

# Lint
npm run lint
```

## License

MIT
