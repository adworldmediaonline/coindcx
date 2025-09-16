# CoinDCX AI Trading Bot

A professional, AI-powered cryptocurrency trading bot built with Next.js 15, React 19, and TypeScript. Features real-time market analysis, automated trading strategies, and comprehensive risk management.

## 🚀 Features

- **AI-Powered Trading Signals**: Machine learning algorithms for market analysis and prediction
- **Real-Time Market Data**: Live price feeds and technical indicators
- **Automated Trading**: Execute trades based on AI signals and predefined strategies
- **Risk Management**: Advanced position sizing, stop-loss, and take-profit controls
- **Beautiful UI**: Modern, responsive interface built with shadcn/ui and Tailwind CSS
- **CoinDCX Integration**: Direct API integration with India's leading crypto exchange
- **Strategy Management**: Create and manage multiple trading strategies
- **Performance Analytics**: Detailed trading statistics and performance metrics

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Backend**: Next.js API Routes
- **AI/ML**: Custom algorithms for technical analysis
- **Exchange Integration**: CoinDCX API
- **State Management**: React hooks and context

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- CoinDCX Pro account with API access
- Basic understanding of cryptocurrency trading

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd coindcx
pnpm install
```

### 2. Environment Setup

Copy the environment template and configure your settings:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your CoinDCX API credentials:

```env
# Get these from https://coindcx.com/settings/api
COINDCX_API_KEY=your_api_key_here
COINDCX_SECRET=your_secret_key_here

# Keep as true for development/testing
USE_MOCK_DATA=true
```

### 3. CoinDCX API Setup

1. Log in to your CoinDCX Pro account
2. Go to Settings → API Management
3. Create a new API key with the following permissions:
   - ✅ Read Info
   - ✅ Enable Trading
   - ✅ Enable Withdrawals (optional)
4. Copy your API Key and Secret to the `.env.local` file

### 4. Run the Application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `COINDCX_API_KEY` | Your CoinDCX API key | - |
| `COINDCX_SECRET` | Your CoinDCX API secret | - |
| `USE_MOCK_DATA` | Use mock data for development | `false` |
| `BOT_DEFAULT_SYMBOL` | Default trading pair | `BTC/USDT` |
| `BOT_MAX_POSITION_SIZE` | Maximum position size (%) | `0.1` |
| `BOT_MAX_RISK_PER_TRADE` | Maximum risk per trade (%) | `0.02` |

See `.env.example` for all available configuration options.

## 📊 Trading Strategies

### Included Strategies

1. **RSI + SMA Strategy**
   - Combines RSI oscillator with moving averages
   - Best for trending markets
   - Configurable RSI and MA periods

2. **MACD Momentum Strategy**
   - Uses MACD divergence for momentum signals
   - Suitable for volatile markets
   - Customizable MACD parameters

### Creating Custom Strategies

```typescript
const customStrategy: AIStrategy = {
  id: 'custom-1',
  name: 'My Custom Strategy',
  description: 'Custom trading logic',
  enabled: false,
  parameters: {
    // Your strategy parameters
  },
  performance: {
    totalTrades: 0,
    winRate: 0,
    profitLoss: 0,
    maxDrawdown: 0,
    sharpeRatio: 0
  }
}
```

## 🎯 Risk Management

### Position Sizing
- Maximum position size: 10% of portfolio
- Risk per trade: 2% of capital
- Maximum drawdown: 5%

### Stop Loss & Take Profit
- Automatic stop-loss orders
- Configurable take-profit levels
- Trailing stop options

### Safety Features
- Maximum open positions limit
- Daily loss limits
- Emergency stop functionality

## 🔄 API Endpoints

### Market Data
```
GET /api/coindcx/market?symbol=BTC/USDT&timeframe=1h&limit=100
```

### Account Balance
```
GET /api/coindcx/balance
```

### Orders
```
GET /api/coindcx/orders?symbol=BTC/USDT
POST /api/coindcx/orders
```

### AI Signals
```
GET /api/ai/signals?symbol=BTC/USDT&price=50000
```

### Bot Status
```
GET /api/bot/status
POST /api/bot/status (with action: start|pause|stop)
```

## 🧪 Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
pnpm start
```

### Code Quality
```bash
pnpm lint
pnpm type-check
```

## 📈 Performance Monitoring

### Key Metrics
- Win Rate: Percentage of profitable trades
- Profit/Loss Ratio: Net profit or loss
- Sharpe Ratio: Risk-adjusted returns
- Maximum Drawdown: Largest peak-to-valley decline

### Logging
- All trades logged with timestamps
- Error tracking and notifications
- Performance analytics dashboard

## 🔒 Security

### API Key Security
- Never commit API keys to version control
- Use environment variables for sensitive data
- Rotate API keys regularly

### Trading Safety
- Start with small position sizes
- Use stop-loss orders on all positions
- Test strategies in paper trading mode first

## 🚨 Important Disclaimers

⚠️ **This software is for educational and research purposes only.**

- **Not Financial Advice**: This bot does not constitute financial advice
- **Trading Risks**: Cryptocurrency trading involves substantial risk of loss
- **Test First**: Always test strategies with paper trading before live deployment
- **Your Responsibility**: You are solely responsible for your trading decisions

## 📞 Support

### Getting Help
1. Check the documentation
2. Review the code examples
3. Open an issue on GitHub

### Common Issues
- **API Connection Failed**: Check your API credentials and network connection
- **Mock Data Not Working**: Ensure `USE_MOCK_DATA=true` in development
- **Strategy Not Trading**: Verify strategy is enabled and has sufficient balance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔄 Updates

Stay updated with the latest features and security patches:

```bash
git pull origin main
pnpm install
pnpm build
```

---

**Happy Trading! 🚀**

Remember: Invest only what you can afford to lose, and always do your own research.