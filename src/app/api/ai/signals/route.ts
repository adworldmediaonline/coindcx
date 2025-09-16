import { NextRequest, NextResponse } from 'next/server'
import { TradingSignal, APIResponse } from '@/lib/types'

// Simple AI/ML logic for demonstration
// In a real application, you'd use proper ML libraries and models

class SimpleAISignalGenerator {
  private historicalData: number[] = []

  // Simple moving average crossover strategy
  generateSignal(price: number, symbol: string): TradingSignal {
    this.historicalData.push(price)

    // Keep only last 20 data points
    if (this.historicalData.length > 20) {
      this.historicalData.shift()
    }

    if (this.historicalData.length < 10) {
      return this.createHoldSignal(symbol, price)
    }

    // Calculate simple moving averages
    const sma5 = this.calculateSMA(5)
    const sma10 = this.calculateSMA(10)
    const sma20 = this.calculateSMA(20)

    // Calculate RSI (simplified)
    const rsi = this.calculateRSI()

    // Calculate volatility (simplified ATR)
    const volatility = this.calculateVolatility()

    // Generate signal based on moving averages and RSI
    let direction: 'buy' | 'sell' | 'hold' = 'hold'
    let confidence = 50
    let strength = 50
    const reasoning: string[] = []

    if (sma5 > sma10 && sma10 > sma20 && rsi < 70) {
      direction = 'buy'
      confidence = Math.min(85, 50 + (rsi < 30 ? 20 : 0))
      strength = Math.min(90, confidence + 10)
      reasoning.push('SMA5 > SMA10 > SMA20 (bullish trend)')
      reasoning.push(`RSI at ${rsi.toFixed(1)} indicates room for growth`)
    } else if (sma5 < sma10 && sma10 < sma20 && rsi > 30) {
      direction = 'sell'
      confidence = Math.min(85, 50 + (rsi > 70 ? 20 : 0))
      strength = Math.min(90, confidence + 10)
      reasoning.push('SMA5 < SMA10 < SMA20 (bearish trend)')
      reasoning.push(`RSI at ${rsi.toFixed(1)} indicates potential reversal`)
    } else {
      reasoning.push('Market conditions are neutral')
      reasoning.push('Waiting for clearer trend signals')
    }

    // Adjust confidence based on volatility
    if (volatility > 0.05) {
      confidence = Math.max(20, confidence - 15)
      reasoning.push('High volatility detected - reducing confidence')
    }

    return {
      symbol,
      direction,
      strength,
      confidence,
      indicators: {
        rsi,
        macd: {
          value: sma5 - sma10,
          signal: sma10 - sma20,
          histogram: (sma5 - sma10) - (sma10 - sma20)
        },
        bollingerBands: {
          upper: sma20 * 1.05,
          middle: sma20,
          lower: sma20 * 0.95
        },
        movingAverages: {
          sma20,
          sma50: sma20, // Simplified
          ema12: sma5, // Simplified
          ema26: sma10 // Simplified
        },
        atr: volatility,
        volatility
      },
      timestamp: Date.now(),
      reasoning
    }
  }

  private calculateSMA(period: number): number {
    if (this.historicalData.length < period) return this.historicalData[0] || 0

    const data = this.historicalData.slice(-period)
    return data.reduce((sum, price) => sum + price, 0) / period
  }

  private calculateRSI(): number {
    if (this.historicalData.length < 14) return 50

    const gains: number[] = []
    const losses: number[] = []

    for (let i = 1; i < Math.min(14, this.historicalData.length); i++) {
      const change = this.historicalData[i] - this.historicalData[i - 1]
      if (change > 0) {
        gains.push(change)
        losses.push(0)
      } else {
        gains.push(0)
        losses.push(Math.abs(change))
      }
    }

    const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / gains.length
    const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / losses.length

    if (avgLoss === 0) return 100

    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  private calculateVolatility(): number {
    if (this.historicalData.length < 2) return 0

    const returns = []
    for (let i = 1; i < this.historicalData.length; i++) {
      const return_pct = (this.historicalData[i] - this.historicalData[i - 1]) / this.historicalData[i - 1]
      returns.push(return_pct)
    }

    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length

    return Math.sqrt(variance)
  }

  private createHoldSignal(symbol: string, price: number): TradingSignal {
    return {
      symbol,
      direction: 'hold',
      strength: 30,
      confidence: 40,
      indicators: {
        rsi: 50,
        macd: { value: 0, signal: 0, histogram: 0 },
        bollingerBands: {
          upper: price * 1.02,
          middle: price,
          lower: price * 0.98
        },
        movingAverages: {
          sma20: price,
          sma50: price,
          ema12: price,
          ema26: price
        },
        atr: 0.01,
        volatility: 0.01
      },
      timestamp: Date.now(),
      reasoning: ['Insufficient data for reliable signal', 'Waiting for more market data']
    }
  }
}

// Global instance (in production, you'd use a proper database/cache)
const signalGenerator = new SimpleAISignalGenerator()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const price = parseFloat(searchParams.get('price') || '0')

    if (!symbol || !price) {
      return NextResponse.json(
        { success: false, error: 'Symbol and price parameters are required' },
        { status: 400 }
      )
    }

    const signal = signalGenerator.generateSignal(price, symbol)

    const response: APIResponse = {
      success: true,
      data: signal,
      timestamp: Date.now()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error generating AI signal:', error)

    const errorResponse: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
