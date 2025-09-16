import {
  CoinDCXCredentials,
  MarketData,
  AccountBalance,
  Order,
  OHLCVData,
  Balance,
} from './types';

export class CoinDCXAPI {
  private baseUrl: string;
  private credentials: CoinDCXCredentials;

  constructor(
    credentials: CoinDCXCredentials,
    baseUrl = 'https://api.coindcx.com'
  ) {
    this.credentials = credentials;
    this.baseUrl = baseUrl;
  }

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, unknown>
  ): Promise<unknown> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-AUTH-APIKEY': this.credentials.apiKey,
      'X-AUTH-SIGNATURE': this.generateSignature(endpoint, body),
      'X-AUTH-TIMESTAMP': Math.floor(Date.now()).toString(),
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method === 'POST') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(
        `CoinDCX API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  private generateSignature(
    endpoint: string,
    body?: Record<string, unknown>
  ): string {
    // Exact CoinDCX API signature generation as per documentation
    const timestamp = Math.floor(Date.now()).toString();
    const payload = body ? new Buffer(JSON.stringify(body)).toString() : '';
    const message = `${endpoint}${timestamp}${payload}`;

    // For Node.js environment, use crypto module
    if (typeof window === 'undefined') {
      // Server-side (Node.js)
      const crypto = require('crypto');
      return crypto
        .createHmac('sha256', this.credentials.secret)
        .update(message)
        .digest('hex');
    } else {
      // Browser environment - use Web Crypto API
      return this.generateBrowserSignature(message);
    }
  }

  private generateBrowserSignature(message: string): string {
    // For browser environment, use Web Crypto API
    // This is a fallback implementation
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', this.credentials.secret)
      .update(message)
      .digest('hex');
  }

  async getMarketData(symbol: string): Promise<MarketData> {
    try {
      // Use the public ticker endpoint for real-time price data (no auth required)
      const response = await fetch(`${this.baseUrl}/exchange/ticker`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tickers = await response.json();

      // Find the specific symbol ticker
      const tickerData = tickers.find(
        (ticker: any) => ticker.market === symbol
      );

      if (!tickerData) {
        throw new Error(`Symbol ${symbol} not found in ticker data`);
      }

      return {
        symbol,
        price: parseFloat(tickerData.last_price),
        change24h: parseFloat(tickerData.change_24_hour),
        volume24h: parseFloat(tickerData.volume),
        ohlcv: [], // Would fetch separately
        lastUpdate: Date.now(),
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  async getOHLCVData(
    symbol: string,
    timeframe = '1h',
    limit = 100
  ): Promise<OHLCVData[]> {
    try {
      // First get market details to find the correct pair format
      const marketDetailsResponse = await fetch(
        `${this.baseUrl}/exchange/v1/markets_details`
      );
      if (!marketDetailsResponse.ok) {
        throw new Error(
          `Failed to fetch market details: ${marketDetailsResponse.status}`
        );
      }

      const markets = await marketDetailsResponse.json();
      const marketInfo = markets.find(
        (market: any) => market.symbol === symbol
      );

      if (!marketInfo) {
        throw new Error(`Market ${symbol} not found`);
      }

      // Use public OHLCV endpoint with correct pair format
      const response = await fetch(
        `https://public.coindcx.com/market_data/candles?pair=${marketInfo.pair}&interval=${timeframe}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.map((item: any) => ({
        timestamp: item.time,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseFloat(item.volume),
      }));
    } catch (error) {
      console.error('Error fetching OHLCV data:', error);
      throw error;
    }
  }

  async getBalance(): Promise<AccountBalance> {
    try {
      const balances = (await this.makeRequest(
        '/exchange/v1/users/balances'
      )) as unknown[];

      const formattedBalances: Balance[] = balances.map((balance: unknown) => {
        const bal = balance as Record<string, unknown>;
        const freeBalance = parseFloat(bal.balance as string) || 0;
        const lockedBalance = parseFloat(bal.locked_balance as string) || 0;

        return {
          currency: bal.currency as string,
          free: freeBalance,
          used: lockedBalance,
          total: freeBalance + lockedBalance,
        };
      });

      const totalValue = formattedBalances.reduce(
        (total: number, balance: Balance) => total + balance.total,
        0
      );

      return {
        balances: formattedBalances,
        totalValue,
        lastUpdate: Date.now(),
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }

  async placeOrder(order: {
    side: 'buy' | 'sell';
    symbol: string;
    amount: number;
    price?: number;
    type: 'market' | 'limit';
  }): Promise<Order> {
    try {
      const orderData = {
        side: order.side,
        symbol: order.symbol,
        total_quantity: order.amount,
        ...(order.price && { price_per_unit: order.price }),
        order_type: order.type === 'market' ? 'market_order' : 'limit_order',
      };

      const response = (await this.makeRequest(
        '/exchange/v1/orders/create',
        'POST',
        orderData
      )) as Record<string, unknown>;

      return {
        id: response.order_id as string,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        amount: order.amount,
        price: order.price,
        status: 'open' as const,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  async getOrders(symbol?: string): Promise<Order[]> {
    try {
      const params = symbol ? `?symbol=${symbol}` : '';
      const orders = (await this.makeRequest(
        `/exchange/v1/orders${params}`
      )) as { orders: unknown[] };

      return orders.orders.map((order: unknown) => {
        const ord = order as Record<string, unknown>;
        return {
          id: ord.order_id as string,
          symbol: ord.symbol as string,
          side: ord.side as 'buy' | 'sell',
          type:
            ord.order_type === 'market_order'
              ? ('market' as const)
              : ('limit' as const),
          amount: parseFloat(ord.total_quantity as string),
          price: parseFloat(ord.price_per_unit as string),
          status: ord.status as 'open' | 'filled' | 'cancelled' | 'expired',
          timestamp: new Date(ord.created_at as string).getTime(),
          filled: parseFloat(ord.filled_quantity as string),
          remaining: parseFloat(ord.remaining_quantity as string),
        };
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/exchange/v1/orders/cancel/${orderId}`, 'POST');
      return true;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  }

  async getMarkets(): Promise<string[]> {
    try {
      const markets = (await this.makeRequest('/exchange/v1/markets')) as {
        currency_pairs: unknown[];
      };
      return markets.currency_pairs.map(
        (market: unknown) =>
          (market as Record<string, unknown>).symbol as string
      );
    } catch (error) {
      console.error('Error fetching markets:', error);
      throw error;
    }
  }
}

// Factory function to create API instance
export const createCoinDCXAPI = (
  credentials: CoinDCXCredentials
): CoinDCXAPI => {
  return new CoinDCXAPI(credentials);
};

// Mock data for development/testing
export const createMockCoinDCXAPI = (): CoinDCXAPI => {
  const mockAPI = new CoinDCXAPI({ apiKey: 'mock', secret: 'mock' });

  // Override methods with mock data
  mockAPI.getMarketData = async (symbol: string): Promise<MarketData> => {
    return {
      symbol,
      price: 50000 + Math.random() * 1000,
      change24h: (Math.random() - 0.5) * 10,
      volume24h: Math.random() * 1000000,
      ohlcv: [],
      lastUpdate: Date.now(),
    };
  };

  mockAPI.getBalance = async (): Promise<AccountBalance> => {
    return {
      balances: [
        { currency: 'BTC', free: 0.5, used: 0.1, total: 0.6 },
        { currency: 'USDT', free: 25000, used: 5000, total: 30000 },
      ],
      totalValue: 30000,
      lastUpdate: Date.now(),
    };
  };

  return mockAPI;
};
