# Crozz Coin Ecosystem Dashboard

A comprehensive dashboard for the Crozz Coin ecosystem built on the Sui blockchain. This dashboard provides:

- 🪙 **Ecosystem Overview** - Real-time metrics and analytics
- 💰 **Balance Manager** - View and manage your crypto balances
- 🛍️ **Service Marketplace** - Browse and trade services
- 📈 **DeepBook Trading** - Trade on the DeepBook protocol
- 👛 **Wallet Integration** - Connect your Sui wallet
- 📊 **Advanced Analytics** - Monitor ecosystem growth

## Features

- **Beautiful Dark UI** - Modern gradient-based design with Radix UI
- **Real-time Analytics** - Charts and metrics with Recharts
- **Wallet Integration** - Full Sui wallet kit support
- **Responsive Design** - Works on desktop and tablet
- **DApp Ready** - Pre-configured for Sui blockchain

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager

### Installation

```bash
cd dashboards
pnpm install
pnpm dev
```

The dashboard will be available at `http://localhost:5174/`

### Build for Production

```bash
pnpm build
pnpm preview
```

## Configuration

Edit `src/config.ts` to customize:
- Ecosystem name and branding
- Logo and colors
- Navigation menu items
- Social links

## Project Structure

```
dashboards/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx       # Main dashboard layout
│   │   ├── Header.tsx          # Top header with logo
│   │   ├── Navigation.tsx      # Side navigation
│   │   ├── OverviewPanel.tsx   # Overview with charts
│   │   └── BalancePanel.tsx    # Balance viewer
│   ├── config.ts               # Ecosystem configuration
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Radix UI** - Component library
- **Recharts** - Data visualization
- **Mysten DApp Kit** - Sui integration

## Version

v1.0.0 - Crozz Coin Ecosystem Dashboard
