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
      'X-Auth-APIKey': this.credentials.apiKey,
      'X-Auth-Signature': this.generateSignature(endpoint, body),
      'X-Auth-Timestamp': Date.now().toString(),
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
    // In a real implementation, you'd use HMAC-SHA256 with your secret key
    // This is a simplified version for demonstration
    const timestamp = Date.now().toString();
    const message = `${endpoint}${timestamp}${
      body ? JSON.stringify(body) : ''
    }`;
    return btoa(message); // Simplified - use proper HMAC in production
  }

  async getMarketData(symbol: string): Promise<MarketData> {
    try {
      const ticker = (await this.makeRequest(`/exchange/ticker`)) as unknown[];

      // Find the specific symbol
      const symbolData = ticker.find(
        (t: unknown) => (t as { market: string }).market === symbol
      ) as
        | { last_price: string; change_24_hour: string; volume_24h: string }
        | undefined;

      if (!symbolData) {
        throw new Error(`Symbol ${symbol} not found`);
      }

      return {
        symbol,
        price: parseFloat(symbolData.last_price),
        change24h: parseFloat(symbolData.change_24_hour),
        volume24h: parseFloat(symbolData.volume_24h),
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
      const data = await this.makeRequest(
        `/exchange/v1/markets/${symbol}/klines?interval=${timeframe}&limit=${limit}`
      );

      return (data as unknown[]).map((item: unknown) => {
        const arr = item as unknown[];
        return {
          timestamp: Number(arr[0]),
          open: parseFloat(arr[1] as string),
          high: parseFloat(arr[2] as string),
          low: parseFloat(arr[3] as string),
          close: parseFloat(arr[4] as string),
          volume: parseFloat(arr[5] as string),
        };
      });
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
        return {
          currency: bal.currency as string,
          free: parseFloat(bal.balance as string),
          used: parseFloat(bal.locked_balance as string),
          total:
            parseFloat(bal.balance as string) +
            parseFloat(bal.locked_balance as string),
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
      const orders = await this.makeRequest(`/exchange/v1/orders${params}`);

      return (orders as unknown[]).map((order: unknown) => {
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
      const markets = await this.makeRequest('/exchange/v1/markets');
      return (markets as unknown[]).map(
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
