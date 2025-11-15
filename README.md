# Morrow - AI-Powered Personal Finance Coach

An intelligent personal finance app that helps users build better money habits through behavioral economics, AI coaching, and automated savings features.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)

## 🌟 Features

### 🏦 Banking Integration
- **Plaid Integration** - Connect to 12,000+ US banks
- **Real-time Transactions** - Automatic categorization and sync
- **Recurring Detection** - Identify subscriptions automatically

### 💰 FDIC-Insured Vaults
- **Increase Banking** - Create goal-based savings vaults
- **Instant Transfers** - Move money between accounts instantly
- **Real-time Balances** - Track progress toward your goals

### 🧠 Behavioral Savings
- **Windfall Wallet** - Capture 20% of unexpected income before mental budgeting
- **Smart Sweep** - Save unspent weekly budget automatically
- **Fresh Start** - Motivational nudges on temporal landmarks (New Year, Monday, etc.)
- **Soft Lock** - 24-hour cooling period for vault withdrawals

### 🎁 Rewards & Gamification
- **Streak Bonuses** - Earn USDC rewards (4/8/12 week milestones)
- **Weekly Challenges** - $5/day challenges with $10 rewards
- **Prize-Linked Savings** - Lottery-style incentives

### 🤖 AI Financial Coach
- **GPT-4 Powered** - Personalized financial advice
- **Behavioral Economics** - Principles-based coaching
- **Non-judgmental** - Supportive and encouraging tone

### 💸 Charitable Giving
- **Locus Integration** - USDC donations on blockchain
- **Pre-configured Charities** - GiveDirectly, Red Cross, Water.org
- **Transaction Tracking** - Full donation history

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **TanStack React Query** - Data fetching and caching
- **Framer Motion** - Smooth animations
- **Wouter** - Lightweight routing

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL/Neon** - Serverless database

### Integrations
- **Plaid** - Bank account linking
- **Increase** - FDIC-insured banking
- **Locus** - Crypto payments (USDC)
- **OpenAI GPT-4** - AI coaching

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- PostgreSQL database (optional for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/devanggaur/Morrow.git
cd Morrow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
# Plaid
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox

# Increase
INCREASE_API_KEY=your_increase_api_key
INCREASE_API_URL=https://sandbox.increase.com

# Locus
LOCUS_API_KEY=your_locus_api_key
LOCUS_API_URL=https://api.paywithlocus.com
LOCUS_WALLET_ADDRESS=your_wallet_address

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:8080

### Testing

Run the API test suite:
```bash
npm run test:api
```

## 📚 Documentation

- **[Backend Summary](BACKEND_SUMMARY.md)** - Complete API reference
- **[Frontend Integration](FRONTEND_INTEGRATION.md)** - Integration examples
- **[Design Guidelines](design_guidelines.md)** - UI/UX specifications

## 🏗️ Project Structure

```
Morrow/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Route pages
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities
│   └── public/              # Static assets
├── server/                  # Express backend
│   ├── plaidClient.ts       # Plaid integration
│   ├── increaseClient.ts    # Increase banking
│   ├── locusClient.ts       # Locus crypto
│   ├── savingsAgent.ts      # Behavioral features
│   ├── routes.ts            # API endpoints
│   └── dbHelpers.ts         # Database operations
├── shared/
│   └── schema.ts            # Database schema
└── test-api.js              # API test script
```

## 🔌 API Endpoints

### Plaid
- `POST /api/plaid/create_link_token` - Create Plaid Link token
- `POST /api/plaid/exchange_public_token` - Exchange public token
- `POST /api/plaid/transactions` - Fetch transactions
- `POST /api/plaid/recurring_transactions` - Get recurring payments

### Increase
- `POST /api/increase/entity` - Create entity (KYC)
- `POST /api/increase/account` - Create account
- `POST /api/increase/vault` - Create savings vault
- `POST /api/increase/transfer` - Transfer between accounts
- `GET /api/increase/balance/:accountId` - Get balance

### Locus
- `GET /api/locus/wallet` - Get wallet balance
- `GET /api/locus/charities` - List charities
- `POST /api/locus/donate` - Make donation

### Savings Agent
- `POST /api/savings/analyze` - Run Triple Play analysis
- `POST /api/savings/windfall/detect` - Detect windfall
- `POST /api/savings/sweep/analyze` - Analyze smart sweep
- `GET /api/savings/fresh-start/check` - Check for fresh start

### AI Coach
- `POST /api/coach/chat` - Chat with AI coach

## 🎨 Design

- **Mobile-first** - Optimized for 390x844px (iPhone)
- **Warm aesthetic** - Soft beige (#F5F0EB) with orange accents (#FFB65C)
- **Accessible** - Built with Radix UI primitives
- **Smooth animations** - Framer Motion for delightful UX

## 🧪 Testing

The project includes a comprehensive test suite:

```bash
npm run test:api
```

**Test Coverage:**
- ✅ Health check
- ✅ Plaid link token creation
- ✅ Locus wallet operations
- ✅ Savings agent features
- ✅ AI coach chat
- ✅ Fresh start detection
- ✅ Withdrawal impact calculation

## 📝 Database Schema

15 tables supporting all features:
- User management
- Plaid accounts & transactions
- Increase entities & accounts
- Locus payments & funding
- Savings challenges & rewards
- Withdrawal requests
- Autonomous actions

See `shared/schema.ts` for full schema.

## 🔐 Security

- Environment variables for secrets
- No API keys in code
- .env excluded from git
- Session-based authentication ready
- Input validation with Zod

## 🚢 Deployment

1. Build the project:
```bash
npm run build
```

2. Set production environment variables

3. Run migrations:
```bash
npm run db:push
```

4. Start the server:
```bash
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by behavioral economics research (Thaler, Kahneman, Milkman)
- Built with [Claude Code](https://claude.com/claude-code)
- Plaid, Increase, and Locus for their excellent APIs

## 📧 Contact

- GitHub: [@devanggaur](https://github.com/devanggaur)
- Repository: [https://github.com/devanggaur/Morrow](https://github.com/devanggaur/Morrow)

---

**Built with ❤️ and AI assistance**
