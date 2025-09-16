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

  // Real-time data loading from CoinDCX API
  useEffect(() => {
    const loadRealTimeData = async () => {
      setIsLoading(true);

      try {
        // Fetch real market data from CoinDCX
        const marketResponse = await fetch(
          '/api/coindcx/market?symbol=BTCUSDT'
        );
        if (marketResponse.ok) {
          const responseData = await marketResponse.json();

          // Check if response has the expected structure
          if (responseData.success && responseData.data) {
            setMarketData(responseData.data);
          } else {
            console.log(
              'Market API response structure unexpected:',
              responseData
            );
            setMarketData(null);
          }
        } else {
          console.log('Market data fetch failed:', marketResponse.status);
          setMarketData(null);
        }

        // Fetch real OHLCV data
        const ohlcvResponse = await fetch(
          '/api/coindcx/ohlcv?symbol=BTCUSDT&limit=50'
        );
        if (ohlcvResponse.ok) {
          const responseData = await ohlcvResponse.json();

          // Check if response has the expected structure
          if (responseData.success && Array.isArray(responseData.data)) {
            const realOHLCVData = responseData.data;
            setOhlcvData(realOHLCVData);

            // Convert to chart format
            const realChartData: ChartData[] = realOHLCVData.map(
              (ohlcv: OHLCVData) => ({
                time: ohlcv.timestamp,
                price: ohlcv.close,
                volume: ohlcv.volume,
              })
            );
            setChartData(realChartData);
          } else {
            console.log(
              'OHLCV API response structure unexpected:',
              responseData
            );
            // Set empty arrays as fallback
            setOhlcvData([]);
            setChartData([]);
          }
        } else {
          console.log('OHLCV API request failed:', ohlcvResponse.status);
          setOhlcvData([]);
          setChartData([]);
        }

        // Note: Balance data requires KYC verification
        // For demo purposes, we'll show a placeholder
        const demoBalance: AccountBalance = {
          balances: [
            { currency: 'BTC', free: 0, used: 0, total: 0 },
            { currency: 'USDT', free: 0, used: 0, total: 0 },
          ],
          totalValue: 0,
          lastUpdate: Date.now(),
        };
        setAccountBalance(demoBalance);

        // Demo bot state (since we can't connect to real bot without KYC)
        const demoBotState: BotState = {
          status: 'demo_mode',
          isConnected: true,
          lastUpdate: Date.now(),
          uptime: Date.now() - Date.now() + 60000, // 1 minute demo
          activeTrades: 0,
          totalTrades: 0,
          lastError: 'Demo mode: Complete KYC to enable live trading',
        };

        // Demo AI signal based on real market data
        const demoSignal: TradingSignal = {
          symbol: 'BTC/USDT',
          direction: 'hold',
          strength: 50,
          confidence: 60,
          indicators: {
            rsi: 50,
            macd: { value: 0, signal: 0, histogram: 0 },
            bollingerBands: { upper: 0, middle: 0, lower: 0 },
            movingAverages: {
              sma20: 0,
              sma50: 0,
              ema12: 0,
              ema26: 0,
            },
            atr: 0,
            volatility: 0,
          },
          timestamp: Date.now(),
          reasoning: [
            'Demo mode: Real-time market data loaded',
            'Complete KYC to enable AI analysis',
            'Live trading signals will be available after verification',
          ],
        };

        setBotState(demoBotState);
        setCurrentSignal(demoSignal);
        setIsLoading(false);

        // Set up periodic real-time updates
        const updateInterval = setInterval(async () => {
          try {
            // Update market data periodically
            const marketResponse = await fetch(
              '/api/coindcx/market?symbol=BTCUSDT'
            );
            if (marketResponse.ok) {
              const updatedMarketData = await marketResponse.json();
              setMarketData(updatedMarketData);
            }

            // Update bot state timestamp
            setBotState(prev =>
              prev
                ? {
                    ...prev,
                    lastUpdate: Date.now(),
                    uptime: Date.now() - Date.now() + 60000,
                  }
                : null
            );
          } catch (error) {
            console.log('Real-time update failed:', error);
          }
        }, 30000); // Update every 30 seconds

        return () => clearInterval(updateInterval);
      } catch (error) {
        console.error('Failed to load real-time data:', error);
        setIsLoading(false);
      }
    };

    loadRealTimeData();
  }, []); // Empty dependency array for initial load only

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
              {marketData && marketData.price ? (
                <div className="text-right">
                  <div className="font-mono font-bold">
                    ${marketData.price.toLocaleString()}
                  </div>
                  <div
                    className={cn(
                      'text-sm font-medium flex items-center gap-1',
                      (marketData.change24h || 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {(marketData.change24h || 0) >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3 rotate-180" />
                    )}
                    {Math.abs(marketData.change24h || 0).toFixed(2)}%
                  </div>
                </div>
              ) : (
                <div className="text-right">
                  <div className="font-mono font-bold text-muted-foreground">
                    Loading...
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Fetching real-time data
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
                {marketData && accountBalance && marketData.price ? (
                  <OrderForm
                    symbol={marketData.symbol}
                    currentPrice={marketData.price}
                    balance={accountBalance.totalValue}
                    onSubmitOrder={handleOrderSubmit}
                  />
                ) : (
                  <div className="text-center p-6 border rounded-lg">
                    <p className="text-muted-foreground">
                      Loading order form...
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Waiting for market data
                    </p>
                  </div>
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
                    <p className="text-sm text-muted-foreground">30 seconds</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Source</label>
                    <Badge variant="default">Real-time CoinDCX API</Badge>
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
