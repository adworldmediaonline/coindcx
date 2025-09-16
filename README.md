# CoinDCX AI Trading Bot

A professional, AI-powered cryptocurrency trading bot built with Next.js 15, React 19, and TypeScript. Features real-time market analysis, automated trading strategies, and comprehensive risk management.

## 🚀 Features

- **AI-Powered Trading Signals**: Machine learning algorithms for market analysis and prediction
- **Real-Time Market Data**: Live price feeds and technical indicators from CoinDCX API
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
- **Exchange Integration**: CoinDCX API with HMAC-SHA256 authentication
- **State Management**: React hooks and context

## 📋 Prerequisites

- Node.js 18+ and pnpm
- CoinDCX Pro account with API access
- Basic understanding of cryptocurrency trading

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd coindcx
pnpm install
```

### 2. CoinDCX API Setup

1. Log in to your CoinDCX Pro account
2. Go to Settings → API Management
3. Create a new API key with the following permissions:
   - ✅ Read Info (for balance and market data)
   - ✅ Enable Trading (for placing orders)
   - ✅ Enable Withdrawals (optional)
4. Copy your API Key and Secret to the `.env.local` file

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# CoinDCX Real API Configuration
COINDCX_API_KEY=your_actual_api_key_here
COINDCX_SECRET=your_actual_secret_here

# Use real API data (set to false for live trading)
USE_MOCK_DATA=false

# Bot Configuration
BOT_DEFAULT_SYMBOL=BTC/USDT
BOT_UPDATE_INTERVAL=5000

# Risk Management (configure carefully)
BOT_MAX_POSITION_SIZE=0.05  # 5% max position (conservative)
BOT_MAX_RISK_PER_TRADE=0.01  # 1% risk per trade
BOT_MAX_DRAWDOWN=0.03  # 3% max drawdown
BOT_STOP_LOSS_PERCENT=0.02
BOT_TAKE_PROFIT_PERCENT=0.04
BOT_MAX_OPEN_POSITIONS=2
BOT_DEFAULT_LEVERAGE=1
```

### 4. Run the Application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 API Configuration

### Real vs Mock Data

The application supports both real CoinDCX API data and mock data for development:

- **Real API**: Set `USE_MOCK_DATA=false` and provide valid API credentials
- **Mock Data**: Set `USE_MOCK_DATA=true` for development/testing

### API Endpoints Used

- `GET /exchange/v1/markets_details` - Market data and prices
- `GET /exchange/v1/users/balances` - Account balance
- `GET /exchange/v1/orders` - Order history
- `POST /exchange/v1/orders/create` - Place new orders
- `POST /exchange/v1/orders/cancel` - Cancel orders

### Authentication

The application uses HMAC-SHA256 signature authentication as required by CoinDCX:

```typescript
const signature = crypto.createHmac('sha256', secret)
  .update(`${endpoint}${timestamp}${body}`)
  .digest('hex');
```

## 🎯 Trading Strategies

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
- Enable IP restrictions on your CoinDCX API keys

### Trading Safety
- Start with small position sizes
- Use stop-loss orders on all positions
- Test strategies in paper trading mode first
- Set appropriate risk limits

## 🚨 Important Disclaimers

⚠️ **This software is for educational and research purposes only.**

- **Not Financial Advice**: This bot does not constitute financial advice
- **Trading Risks**: Cryptocurrency trading involves substantial risk of loss
- **Test First**: Always test strategies with paper trading before live deployment
- **Your Responsibility**: You are solely responsible for your trading decisions
- **Start Small**: Begin with minimal capital and gradually increase exposure

## 📞 Support

### Getting Help
1. Check the API response logs in browser console
2. Verify your CoinDCX API credentials and permissions
3. Test API endpoints individually
4. Check CoinDCX API documentation for latest changes

### Common Issues
- **API Connection Failed**: Check your API credentials and network connection
- **Invalid Signature**: Ensure your secret key is correct and HMAC-SHA256 is properly implemented
- **Insufficient Permissions**: Verify your API key has required permissions
- **Rate Limits**: CoinDCX has API rate limits - implement proper request throttling

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

**⚠️ Trading cryptocurrencies carries significant risk. Only trade with money you can afford to lose. Always do your own research and consider consulting with financial professionals before making trading decisions.**

**Happy Trading! 🚀**