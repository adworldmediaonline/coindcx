// CoinDCX API Types
export interface CoinDCXCredentials {
  apiKey: string;
  secret: string;
}

export interface CoinDCXConfig {
  credentials: CoinDCXCredentials;
  paperTrading: boolean;
  baseUrl: string;
  symbol: string;
  symbolFutures?: string;
  leverage?: number;
  riskPerTrade: number;
  maxRisk: number;
}

// Market Data Types
export interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  ohlcv: OHLCVData[];
  lastUpdate: number;
}

export interface Balance {
  currency: string;
  free: number;
  used: number;
  total: number;
}

export interface AccountBalance {
  balances: Balance[];
  totalValue: number;
  lastUpdate: number;
}

// Trading Types
export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  amount: number;
  price?: number;
  status: 'open' | 'filled' | 'cancelled' | 'expired';
  timestamp: number;
  filled?: number;
  remaining?: number;
  fee?: number;
}

export interface Position {
  symbol: string;
  side: 'long' | 'short';
  amount: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  leverage?: number;
  liquidationPrice?: number;
}

// AI/ML Types
export interface TechnicalIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    ema12: number;
    ema26: number;
  };
  atr: number;
  volatility: number;
}

export interface TradingSignal {
  symbol: string;
  direction: 'buy' | 'sell' | 'hold';
  strength: number; // 0-100
  confidence: number; // 0-100
  indicators: TechnicalIndicators;
  timestamp: number;
  reasoning: string[];
}

export interface AIStrategy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  parameters: Record<string, unknown>;
  performance: {
    totalTrades: number;
    winRate: number;
    profitLoss: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
}

// Bot Status Types
export type BotStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'error'
  | 'stopped'
  | 'demo_mode';

export interface BotState {
  status: BotStatus;
  isConnected: boolean;
  lastUpdate: number;
  uptime: number;
  activeTrades: number;
  totalTrades: number;
  currentSignal?: TradingSignal;
  lastError?: string;
}

// Risk Management Types
export interface RiskSettings {
  maxPositionSize: number;
  maxRiskPerTrade: number;
  maxDrawdown: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  maxOpenPositions: number;
  leverage: number;
}

export interface RiskMetrics {
  currentDrawdown: number;
  totalRisk: number;
  availableCapital: number;
  usedCapital: number;
  riskRatio: number;
}

// UI Component Types
export interface ChartData {
  time: number;
  price: number;
  volume?: number;
  indicators?: Partial<TechnicalIndicators>;
}

export interface TradeHistoryItem {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  pnl?: number;
  fee?: number;
}

// API Response Types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// WebSocket Event Types
export interface WebSocketMessage {
  type:
    | 'market_data'
    | 'balance_update'
    | 'order_update'
    | 'signal_update'
    | 'bot_status';
  data: Record<string, unknown>;
  timestamp: number;
}

// Configuration Types
export interface BotConfiguration {
  id: string;
  name: string;
  description: string;
  coinDCX: CoinDCXConfig;
  aiStrategies: AIStrategy[];
  riskSettings: RiskSettings;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AppConfig {
  theme: 'light' | 'dark' | 'system';
  refreshInterval: number;
  notifications: {
    enabled: boolean;
    signals: boolean;
    trades: boolean;
    errors: boolean;
  };
  chart: {
    timeframe: string;
    indicators: string[];
    theme: 'light' | 'dark';
  };
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown>
    ? DeepPartial<T[P]>
    : T[P];
};

export type WithTimestamps<T> = T & {
  createdAt: number;
  updatedAt: number;
};

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in';
  value: string | number | boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
  stack?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}
