'use client'

import { ChartData, OHLCVData } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface TradingChartProps {
  data: ChartData[]
  ohlcv: OHLCVData[]
  symbol: string
  currentPrice: number
  priceChange: number
  volume: number
  className?: string
}

type ChartType = 'line' | 'candle' | 'volume'
type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d'

export const TradingChart = ({
  data,
  ohlcv,
  symbol,
  currentPrice,
  priceChange,
  volume,
  className
}: TradingChartProps) => {
  const [chartType, setChartType] = useState<ChartType>('candle')
  const [timeframe, setTimeframe] = useState<Timeframe>('1h')
  const [showIndicators, setShowIndicators] = useState(true)

  const priceChangePercent = ((priceChange / (currentPrice - priceChange)) * 100).toFixed(2)
  const isPositive = priceChange >= 0

  const timeframes: { value: Timeframe; label: string }[] = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' }
  ]

  const chartTypes: { value: ChartType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'line', label: 'Line', icon: TrendingUp },
    { value: 'candle', label: 'Candlestick', icon: BarChart3 },
    { value: 'volume', label: 'Volume', icon: Activity }
  ]

  // Mock chart rendering - in a real app, you'd use a charting library like TradingView or Chart.js
  const renderChart = () => {
    const maxPrice = Math.max(...data.map(d => d.price))
    const minPrice = Math.min(...data.map(d => d.price))
    const priceRange = maxPrice - minPrice

    return (
      <div className="relative w-full h-64 bg-card border rounded-lg p-4">
        {/* Chart Grid */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-border"
              style={{ top: `${(i * 25)}%` }}
            />
          ))}
        </div>

        {/* Price Labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>
              ${(maxPrice - (priceRange * i) / 4).toFixed(2)}
            </span>
          ))}
        </div>

        {/* Main Chart Area */}
        <div className="ml-12 h-full relative">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {chartType === 'line' && (
              <path
                d={`M ${data.map((point, i) => {
                  const x = (i / (data.length - 1)) * 380
                  const y = ((maxPrice - point.price) / priceRange) * 180 + 10
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                }).join(' ')}`}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                fill="none"
              />
            )}

            {chartType === 'candle' && (
              <g>
                {ohlcv.slice(-20).map((candle: OHLCVData, i: number) => {
                  const x = (i / 19) * 380
                  const open = ((maxPrice - candle.open) / priceRange) * 180 + 10
                  const close = ((maxPrice - candle.close) / priceRange) * 180 + 10
                  const high = ((maxPrice - candle.high) / priceRange) * 180 + 10
                  const low = ((maxPrice - candle.low) / priceRange) * 180 + 10
                  const isGreen = candle.close >= candle.open

                  return (
                    <g key={i}>
                      {/* Wick */}
                      <line
                        x1={x}
                        y1={high}
                        x2={x}
                        y2={low}
                        stroke={isGreen ? '#22c55e' : '#ef4444'}
                        strokeWidth="1"
                      />
                      {/* Body */}
                      <rect
                        x={x - 2}
                        y={Math.min(open, close)}
                        width="4"
                        height={Math.abs(close - open)}
                        fill={isGreen ? '#22c55e' : '#ef4444'}
                      />
                    </g>
                  )
                })}
              </g>
            )}

            {chartType === 'volume' && (
              <g>
                {data.slice(-20).map((point, i) => {
                  const x = (i / 19) * 380
                  const height = (point.volume || 0) / Math.max(...data.map(d => d.volume || 0)) * 180
                  const y = 190 - height

                  return (
                    <rect
                      key={i}
                      x={x - 1}
                      y={y}
                      width="2"
                      height={height}
                      fill="hsl(var(--primary))"
                      opacity="0.7"
                    />
                  )
                })}
              </g>
            )}
          </svg>
        </div>

        {/* Current Price Line */}
        <div
          className="absolute left-12 right-4 border-t-2 border-primary"
          style={{
            top: `${((maxPrice - currentPrice) / priceRange) * 100 + 5}%`
          }}
        >
          <span className="absolute -left-12 top-0 -translate-y-1/2 bg-background px-2 py-1 rounded text-xs font-mono border">
            ${currentPrice.toFixed(2)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {symbol}
          </CardTitle>

          <div className="flex items-center gap-4">
            {/* Price Info */}
            <div className="text-right">
              <div className="text-lg font-bold font-mono">
                ${currentPrice.toFixed(2)}
              </div>
              <div className={cn(
                'text-sm font-medium flex items-center gap-1',
                isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent}%)
              </div>
            </div>

            {/* Volume */}
            <Badge variant="outline" className="font-mono">
              Vol: {(volume / 1000000).toFixed(2)}M
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chart Controls */}
        <div className="flex items-center justify-between">
          {/* Timeframe Selector */}
          <div className="flex gap-1">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant={timeframe === tf.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(tf.value)}
                className="text-xs"
              >
                {tf.label}
              </Button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex gap-1">
            {chartTypes.map((type) => {
              const Icon = type.icon
              return (
                <Button
                  key={type.value}
                  variant={chartType === type.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType(type.value)}
                  className="flex items-center gap-1 text-xs"
                >
                  <Icon className="w-3 h-3" />
                  {type.label}
                </Button>
              )
            })}
          </div>

          {/* Indicators Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIndicators(!showIndicators)}
            className="flex items-center gap-1 text-xs"
          >
            {showIndicators ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Indicators
          </Button>
        </div>

        {/* Chart Area */}
        {renderChart()}

        {/* Indicators Section */}
        {showIndicators && (
          <div className="grid grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">RSI</div>
              <div className="text-sm font-medium">65.4</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">MACD</div>
              <div className="text-sm font-medium text-green-600">+0.023</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">BB Upper</div>
              <div className="text-sm font-medium">${(currentPrice * 1.02).toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">ATR</div>
              <div className="text-sm font-medium">0.45%</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
