'use client';

import { useState, useEffect } from 'react';
import {
  MarketData,
  AccountBalance,
  BotState,
  TradingSignal,
  AIStrategy,
  RiskSettings,
  OHLCVData,
  ChartData,
} from '@/lib/types';
import { BotStatus } from '@/components/common/bot-status';
import { TradingChart } from '@/components/trading/trading-chart';
import { OrderForm } from '@/components/trading/order-form';
import { AccountBalance as AccountBalanceComponent } from '@/components/trading/balance';
import { AISignal } from '@/components/ai/ai-signal';
import { StrategyManager } from '@/components/ai/strategy-manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  TrendingUp,
  Brain,
  Settings,
  Activity,
  BarChart3,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  // State management
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [accountBalance, setAccountBalance] = useState<AccountBalance | null>(
    null
  );
  const [botState, setBotState] = useState<BotState | null>(null);
  const [currentSignal, setCurrentSignal] = useState<TradingSignal | null>(
    null
  );
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [ohlcvData, setOhlcvData] = useState<OHLCVData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock strategies for demonstration
  const [strategies, setStrategies] = useState<AIStrategy[]>([
    {
      id: '1',
      name: 'RSI + SMA Strategy',
      description:
        'Combines RSI oscillator with moving averages for trend following',
      enabled: true,
      parameters: {
        rsiPeriod: 14,
        smaShort: 20,
        smaLong: 50,
        stopLoss: 0.02,
        takeProfit: 0.05,
      },
      performance: {
        totalTrades: 47,
        winRate: 68.5,
        profitLoss: 1247.32,
        maxDrawdown: 3.2,
        sharpeRatio: 1.85,
      },
    },
    {
      id: '2',
      name: 'MACD Momentum',
      description: 'Uses MACD divergence for momentum-based entries',
      enabled: false,
      parameters: {
        rsiPeriod: 14,
        smaShort: 12,
        smaLong: 26,
        stopLoss: 0.015,
        takeProfit: 0.03,
      },
      performance: {
        totalTrades: 23,
        winRate: 52.1,
        profitLoss: 189.45,
        maxDrawdown: 5.8,
        sharpeRatio: 0.92,
      },
    },
  ]);

  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    maxPositionSize: 0.1,
    maxRiskPerTrade: 0.02,
    maxDrawdown: 0.05,
    stopLossPercent: 0.02,
    takeProfitPercent: 0.05,
    maxOpenPositions: 3,
    leverage: 1,
  });

  // Mock data for demonstration
  useEffect(() => {
    const loadMockData = async () => {
      setIsLoading(true);

      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock market data
      const mockMarketData: MarketData = {
        symbol: 'BTC/USDT',
        price: 50123.45,
        change24h: 2.34,
        volume24h: 1250000,
        ohlcv: [],
        lastUpdate: Date.now(),
      };

      // Mock OHLCV data
      const mockOHLCV: OHLCVData[] = Array.from({ length: 50 }, (_, i) => ({
        timestamp: Date.now() - (49 - i) * 3600000,
        open: 50000 + Math.random() * 1000,
        high: 50200 + Math.random() * 800,
        low: 49800 + Math.random() * 600,
        close: 50000 + Math.random() * 1000,
        volume: Math.random() * 100,
      }));

      // Mock chart data
      const mockChartData: ChartData[] = mockOHLCV.map(ohlcv => ({
        time: ohlcv.timestamp,
        price: ohlcv.close,
        volume: ohlcv.volume,
      }));

      // Mock balance
      const mockBalance: AccountBalance = {
        balances: [
          { currency: 'BTC', free: 0.234, used: 0.056, total: 0.29 },
          { currency: 'USDT', free: 15432.67, used: 2341.23, total: 17773.9 },
        ],
        totalValue: 17773.9,
        lastUpdate: Date.now(),
      };

      // Mock bot state
      const mockBotState: BotState = {
        status: 'running',
        isConnected: true,
        lastUpdate: Date.now(),
        uptime: 345600000, // 4 days
        activeTrades: 1,
        totalTrades: 47,
        lastError: undefined,
      };

      // Mock AI signal
      const mockSignal: TradingSignal = {
        symbol: 'BTC/USDT',
        direction: 'buy',
        strength: 75,
        confidence: 82,
        indicators: {
          rsi: 45.2,
          macd: { value: -12.34, signal: -8.91, histogram: -3.43 },
          bollingerBands: { upper: 51200, middle: 50123, lower: 49046 },
          movingAverages: {
            sma20: 49876,
            sma50: 49543,
            ema12: 49987,
            ema26: 49765,
          },
          atr: 0.023,
          volatility: 0.018,
        },
        timestamp: Date.now(),
        reasoning: [
          'RSI indicates oversold conditions',
          'Price approaching lower Bollinger Band',
          'MACD showing potential bullish divergence',
        ],
      };

      setMarketData(mockMarketData);
      setOhlcvData(mockOHLCV);
      setChartData(mockChartData);
      setAccountBalance(mockBalance);
      setBotState(mockBotState);
      setCurrentSignal(mockSignal);
      setIsLoading(false);
    };

    loadMockData();

    // Set up periodic updates
    const interval = setInterval(() => {
      if (marketData && accountBalance && botState) {
        // Update prices slightly
        const priceChange = (Math.random() - 0.5) * 200;
        setMarketData(prev =>
          prev
            ? {
                ...prev,
                price: prev.price + priceChange,
                change24h: prev.change24h + (Math.random() - 0.5) * 0.1,
                lastUpdate: Date.now(),
              }
            : null
        );

        // Update bot uptime
        setBotState(prev =>
          prev
            ? {
                ...prev,
                uptime: prev.uptime + 5000,
                lastUpdate: Date.now(),
              }
            : null
        );
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []); // Remove dependencies to prevent infinite loop

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleBotAction = async (action: 'start' | 'pause' | 'stop') => {
    if (!botState) return;

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setBotState(prev =>
      prev
        ? {
            ...prev,
            status:
              action === 'start'
                ? 'running'
                : action === 'pause'
                ? 'paused'
                : 'stopped',
            lastUpdate: Date.now(),
          }
        : null
    );
  };

  const handleOrderSubmit = async (order: {
    side: 'buy' | 'sell';
    type: 'market' | 'limit' | 'stop' | 'stop_limit';
    amount: number;
    price?: number;
    stopPrice?: number;
    total?: number;
  }) => {
    console.log('Submitting order:', order);
    // Mock order submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`Order submitted: ${order.side.toUpperCase()} ${order.amount} BTC`);
  };

  const handleStrategyUpdate = (strategy: AIStrategy) => {
    setStrategies(prev => prev.map(s => (s.id === strategy.id ? strategy : s)));
  };

  const handleStrategyCreate = (strategy: AIStrategy) => {
    setStrategies(prev => [...prev, strategy]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading CoinDCX AI Bot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">CoinDCX AI Bot</h1>
                <p className="text-sm text-muted-foreground">
                  Automated Trading Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {marketData && (
                <div className="text-right">
                  <div className="font-mono font-bold">
                    ${marketData.price.toLocaleString()}
                  </div>
                  <div
                    className={cn(
                      'text-sm font-medium flex items-center gap-1',
                      marketData.change24h >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {marketData.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3 rotate-180" />
                    )}
                    {marketData.change24h.toFixed(2)}%
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Strategies
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bot Status */}
              <div className="lg:col-span-1">
                {botState && (
                  <BotStatus
                    botState={botState}
                    onStart={() => handleBotAction('start')}
                    onPause={() => handleBotAction('pause')}
                    onStop={() => handleBotAction('stop')}
                  />
                )}
              </div>

              {/* Market Overview */}
              <div className="lg:col-span-2">
                {marketData && chartData.length > 0 && (
                  <TradingChart
                    data={chartData}
                    ohlcv={ohlcvData}
                    symbol={marketData.symbol}
                    currentPrice={marketData.price}
                    priceChange={marketData.change24h}
                    volume={marketData.volume24h}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Balance */}
              {accountBalance && (
                <AccountBalanceComponent accountBalance={accountBalance} />
              )}

              {/* AI Signal */}
              {currentSignal && (
                <AISignal
                  signal={currentSignal}
                  isActive={botState?.status === 'running'}
                  onExecute={() => console.log('Executing signal')}
                  onDismiss={() => setCurrentSignal(null)}
                />
              )}
            </div>
          </TabsContent>

          {/* Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Form */}
              <div className="lg:col-span-1">
                {marketData && accountBalance && (
                  <OrderForm
                    symbol={marketData.symbol}
                    currentPrice={marketData.price}
                    balance={accountBalance.totalValue}
                    onSubmitOrder={handleOrderSubmit}
                  />
                )}
              </div>

              {/* Trading Chart */}
              <div className="lg:col-span-2">
                {marketData && chartData.length > 0 && (
                  <TradingChart
                    data={chartData}
                    ohlcv={ohlcvData}
                    symbol={marketData.symbol}
                    currentPrice={marketData.price}
                    priceChange={marketData.change24h}
                    volume={marketData.volume24h}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          {/* AI Strategies Tab */}
          <TabsContent value="ai" className="space-y-6">
            <StrategyManager
              strategies={strategies}
              onStrategyUpdate={handleStrategyUpdate}
              onStrategyCreate={handleStrategyCreate}
              riskSettings={riskSettings}
              onRiskSettingsUpdate={setRiskSettings}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Theme</label>
                    <p className="text-sm text-muted-foreground">
                      Currently using system theme
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Refresh Interval
                    </label>
                    <p className="text-sm text-muted-foreground">5 seconds</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mock Data</label>
                    <Badge variant="secondary">Enabled (Development)</Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Status</label>
                    <Badge variant="default">Connected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
